const express = require('express');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const Helper = require('../models/Helper');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ------------------- policy (mdw_policy) connection -------------------
const {
    MONGODB_URI_POLICY = 'mongodb://127.0.0.1:27017/mdw_policy',
    DOC_TITLE = 'Hiring a Foreign Domestic Worker (MDW) in Singapore'
} = process.env;

const policyConn = mongoose.createConnection(MONGODB_URI_POLICY);

const MdwChunkSchema = new mongoose.Schema({
    source: { type: String, default: 'pdf' },
    title: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'mdw_chunks' });

const MdwChunk = policyConn.model('MdwChunk', MdwChunkSchema);

// ------------------- in-memory vector index helpers -------------------
let MDW_INDEX = []; // [{ text, title, chunkIndex, vec }]
let MDW_READY = false;

function l2norm(v) { let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]; return Math.sqrt(s); }
function normalize(v) { const n = l2norm(v) || 1; return v.map(x => x / n); }
function cosine(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

// ---- LOCAL embedding for queries ----
let _embedder = null;
async function getLocalEmbedder() {
    if (!_embedder) {
        const { pipeline } = await import('@xenova/transformers');
        _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return _embedder;
}

async function embedLocal(text) {
    const ef = await getLocalEmbedder();
    const out = await ef(text, { pooling: 'mean', normalize: true }); // unit vector
    return Array.from(out.data);
}

async function loadMdwIndexOnce() {
    if (MDW_READY) return;
    const chunks = await MdwChunk.find(
        { source: 'pdf', title: DOC_TITLE },
        { text: 1, title: 1, chunkIndex: 1, embedding: 1, _id: 0 }
    ).lean();

    MDW_INDEX = chunks.map(c => ({
        text: c.text,
        title: c.title,
        chunkIndex: c.chunkIndex,
        vec: normalize(c.embedding) // model already normalized, this is harmless
    }));
    MDW_READY = MDW_INDEX.length > 0;
    console.log(`[mdw_policy] loaded ${MDW_INDEX.length} chunks`);
}

async function searchMdw(question, k = 5) {
    await loadMdwIndexOnce();
    if (!MDW_READY) return [];
    const qvec = normalize(await embedLocal(question));
    const scored = MDW_INDEX.map(m => ({ ...m, score: cosine(qvec, m.vec) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
}

function buildMdwPrompt(question, passages) {
    const sourcesBlock = passages
        .map((p, i) => `Source ${i + 1} (score ${p.score.toFixed(3)}):\n${p.text}`)
        .join('\n\n');
    const system =
        `You are a helpful assistant for Singapore employers about hiring Migrant Domestic Workers (MDWs).
Answer conversationally and accurately using ONLY the provided sources.
If the sources don't contain the answer, say you don't have that info and suggest checking the MOM website.
Cite snippets by saying "Source 1/2/3". Do not fabricate policy.`;
    const user =
        `Question: ${question}

Relevant sources:
${sourcesBlock}`;
    return { system, user };
}

// crude detector: MDW policy queries (extend as needed)
const MDW_POLICY_REGEX = /\b(mdws?|migrant domestic|work permit|levy|security bond|maid insurance|medical (exam|insurance)|eop|settling-in|employer eligibility|household income|rest day|handover)\b/i;

// ------------------- main route -------------------
router.post('/', async (req, res) => {
    const { message, mode } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // stream headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');

    try {
        const isHelperQuery = /helper|maid/i.test(message);
        const isMdwPolicyQuery = MDW_POLICY_REGEX.test(message);

        // ===== Branch 1: Helper search =====
        if (mode === 'helper' || (!mode && isHelperQuery)) {
            const analysis = await openai.chat.completions.create({
                model: 'gpt-5',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Extract helper search criteria from the following user message and respond as JSON with keys: nationality, minAge, maxAge, minExperience, skills (array). If not specified, use null.'
                    },
                    { role: 'user', content: message }
                ],
                response_format: { type: 'json_object' }
            });

            let filters = {};
            try {
                filters = JSON.parse(analysis.choices[0]?.message?.content ?? '{}');
            } catch {
                filters = {};
            }

            const query = {};
            if (filters.nationality) query.nationality = new RegExp(filters.nationality, 'i');
            if (filters.minAge || filters.maxAge) query.age = {};
            if (filters.minAge) query.age.$gte = filters.minAge;
            if (filters.maxAge) query.age.$lte = filters.maxAge;
            if (filters.minExperience) query.experience = { $gte: filters.minExperience };
            if (filters.skills && filters.skills.length) {
                query.skills = { $all: filters.skills.map(s => new RegExp(s, 'i')) };
            }

            const helpers = await Helper.find(query).limit(3).lean();
            if (!helpers.length) {
                res.write('contact desmond @ +65 82000631');
                return res.end();
            }
            const formatted = helpers
                .map(
                    h => `- ${h.name} (${h.age}, ${h.nationality}) — ${h.skills.join(', ')}`
                )
                .join('\n');
            res.write(formatted);
            return res.end();
        }

        // ===== Branch 2: MDW Policy (PDF-first RAG on mdw_policy) =====
        if (mode === 'policy' || (!mode && isMdwPolicyQuery)) {
            const top = await searchMdw(message, 5);
            if (!top.length) {
                res.write('contact desmond @ +65 82000631');
                return res.end();
            }
            const { system, user } = buildMdwPrompt(message, top);

            const stream = await openai.chat.completions.create({
                model: 'gpt-5',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ],
                stream: true
            });

            for await (const part of stream) {
                const token = part.choices?.[0]?.delta?.content || '';
                if (token) res.write(token);
            }

            const srcLines = top
                .map((p, i) => `\n[Source ${i + 1}] ${p.title || 'MDW Guide'} — chunk #${p.chunkIndex} (score ${p.score.toFixed(3)})`)
                .join('');
            res.write(`\n${srcLines}`);
            return res.end();
        }

        // ===== Fallback =====
        res.write('contact desmond @ +65 82000631');
        return res.end();

    } catch (err) {
        console.error(err);
        res.status(500);
        res.write('contact desmond @ +65 82000631');
        return res.end();
    }
});

module.exports = router;
