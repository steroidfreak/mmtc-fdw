const express = require('express');
const OpenAI = require('openai');
const Agent = require('../utils/agent');
const mongoose = require('mongoose');
const Helper = require('../models/Helper');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Placeholder tools list will be populated below
// but ensure variable exists before Agent creation.
const tools = [];

// ------------------- policy (mdw_policy) connection -------------------
const {
    MONGODB_URI_POLICY = 'mongodb://127.0.0.1:27017/mdw_policy',
    DOC_TITLE = 'Hiring a Foreign Domestic Worker (MDW) in Singapore',
} = process.env;

const policyConn = mongoose.createConnection(MONGODB_URI_POLICY);

const MdwChunkSchema = new mongoose.Schema(
    {
        source: { type: String, default: 'pdf' },
        title: { type: String, required: true },
        chunkIndex: { type: Number, required: true },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: 'mdw_chunks' }
);

const MdwChunk = policyConn.model('MdwChunk', MdwChunkSchema);

// ------------------- in-memory vector index helpers -------------------
let MDW_INDEX = []; // [{ text, title, chunkIndex, vec }]
let MDW_READY = false;

function l2norm(v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * v[i];
    return Math.sqrt(s);
}
function normalize(v) {
    const n = l2norm(v) || 1;
    return v.map((x) => x / n);
}
function cosine(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

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

    MDW_INDEX = chunks.map((c) => ({
        text: c.text,
        title: c.title,
        chunkIndex: c.chunkIndex,
        vec: normalize(c.embedding), // model already normalized; re-normalize for safety
    }));
    MDW_READY = MDW_INDEX.length > 0;
    console.log(`[mdw_policy] loaded ${MDW_INDEX.length} chunks`);
}

async function searchMdw(question, k = 5) {
    await loadMdwIndexOnce();
    if (!MDW_READY) return [];
    const qvec = normalize(await embedLocal(question));
    const scored = MDW_INDEX.map((m) => ({ ...m, score: cosine(qvec, m.vec) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
}

function buildMdwPrompt(question, passages) {
    const sourcesBlock = passages
        .map((p, i) => `Source ${i + 1} (score ${p.score.toFixed(3)}):\n${p.text}`)
        .join('\n\n');

    const system = `You are a helpful assistant for Singapore employers about hiring Migrant Domestic Workers (MDWs).
Answer conversationally and accurately using ONLY the provided sources.
If the sources don't contain the answer, say you don't have that info and suggest checking the MOM website.
Cite snippets by saying "Source 1/2/3". Do not fabricate policy.`;

    const user = `Question: ${question}

Relevant sources:
${sourcesBlock}`;

    return { system, user };
}

// crude detector: MDW policy queries (extend as needed)
const MDW_POLICY_REGEX =
    /\b(mdws?|migrant domestic|work permit|levy|security bond|maid insurance|medical (exam|insurance)|eop|settling-in|employer eligibility|household income|rest day|handover)\b/i;

// ------------------- agent tools -------------------
tools.push({
    type: 'function',
    function: {
        name: 'find_helpers',
        description:
            'Search the helper database with optional filters. Returns a short formatted list or a contact message if none found.',
        parameters: {
            type: 'object',
            properties: {
                nationality: { type: 'string', nullable: true },
                minAge: { type: 'number', nullable: true },
                maxAge: { type: 'number', nullable: true },
                minExperience: { type: 'number', nullable: true },
                skills: { type: 'array', items: { type: 'string' }, nullable: true },
            },
        },
    },
    async handler(params = {}) {
        const query = {};
        if (params.nationality) query.nationality = new RegExp(params.nationality, 'i');
        if (params.minAge || params.maxAge) query.age = {};
        if (params.minAge != null) query.age.$gte = Number(params.minAge);
        if (params.maxAge != null) query.age.$lte = Number(params.maxAge);
        if (params.minExperience != null) query.experience = { $gte: Number(params.minExperience) };
        if (params.skills && Array.isArray(params.skills) && params.skills.length) {
            query.skills = { $all: params.skills.map((s) => new RegExp(String(s), 'i')) };
        }
        const helpers = await Helper.find(query).limit(3).lean();
        if (!helpers.length) return 'contact desmond @ +65 82000631';
        const lines = helpers.map((h) => {
            const skills = Array.isArray(h.skills) ? h.skills.join(', ') : '';
            return `- ${h.name} (${h.age}, ${h.nationality}) — ${skills}`;
        });
        return lines.join('\\n');
    },
});

tools.push({
    type: 'function',
    function: {
        name: 'mdw_policy',
        description:
            'Answer questions about hiring Migrant Domestic Workers in Singapore using internal policy documents.',
        parameters: {
            type: 'object',
            properties: {
                question: { type: 'string' },
            },
            required: ['question'],
        },
    },
    async handler({ question }) {
        const top = await searchMdw(question, 5);
        if (!top.length) return 'contact desmond @ +65 82000631';
        const { system, user } = buildMdwPrompt(question, top);
        const completion = await openai.chat.completions.create({
            model: process.env.MODEL || 'gpt-5',
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
        });
        const answer = completion.choices?.[0]?.message?.content || '';
        const srcLines = top
            .map(
                (p, i) =>
                    `\\n[Source ${i + 1}] ${p.title || 'MDW Guide'} — chunk #${p.chunkIndex} (score ${p.score.toFixed(3)})`
            )
            .join('');
        return answer + srcLines;
    },
});

const agent = new Agent({
    name: 'Modular Chatbot',
    instructions: [
        'You are a concise, helpful assistant.',
        'If the user asks about content from files, prefer using the file tool.',
        'Cite filenames when answering from files.',
    ].join(' '),
    model: process.env.MODEL || 'gpt-5',
    tools,
    openai,
    reasoning: { effort: 'low' },
    verbosity: 'low',
});

// ------------------- main route -------------------
router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = await agent.run(message, { stream: true });
        for await (const part of stream) {
            const token = part?.output_text || part?.content || '';
            if (token) res.write(token);
        }
        return res.end();
    } catch (err) {
        console.error(err);
        try {
            res.write('contact desmond @ +65 82000631');
            return res.end();
        } catch {
            // connection may already be closed
        }
    }
});

module.exports = router;
