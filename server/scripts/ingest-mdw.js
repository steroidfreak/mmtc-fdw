// Usage: node scripts/ingest-mdw.js "./pdfs/Hiring a Foreign Domestic Worker (Migrant Domestic Worker) in Singapore.pdf"
require('dotenv').config();
const fs = require('fs');
const pdf = require('pdf-parse');
const mongoose = require('mongoose');

const {
    MONGODB_URI_POLICY = 'mongodb://127.0.0.1:27017/mdw_policy',
    DOC_TITLE = 'Hiring a Foreign Domestic Worker (MDW) in Singapore'
} = process.env;

// Mongoose model (only in this script; separate from your app)
const MdwChunkSchema = new mongoose.Schema({
    source: { type: String, default: 'pdf' },
    title: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'mdw_chunks' });

function chunkText(text, { chunkSize = 900, overlap = 150 } = {}) {
    const normalized = text
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\u00A0/g, ' ');

    const paras = normalized.split(/\n{2,}/g).map(p => p.trim()).filter(Boolean);
    const chunks = [];
    for (const p of paras) {
        const words = p.split(/\s+/);
        if (words.length <= chunkSize) {
            chunks.push(p);
        } else {
            let i = 0;
            while (i < words.length) {
                chunks.push(words.slice(i, i + chunkSize).join(' '));
                i += (chunkSize - overlap);
            }
        }
    }
    // add lightweight section labels to help retrieval
    return chunks.map((t, i) => `Section ${i + 1}:\n${t}`);
}

// ---- LOCAL EMBEDDINGS (MiniLM) ----
// Use dynamic import because @xenova/transformers is ESM
let _embedder = null;
async function getLocalEmbedder() {
    if (!_embedder) {
        const { pipeline } = await import('@xenova/transformers');
        _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return _embedder;
}

async function embedBatchLocal(texts) {
    const ef = await getLocalEmbedder();
    const out = [];
    for (const t of texts) {
        const res = await ef(t, { pooling: 'mean', normalize: true }); // unit vector
        out.push(Array.from(res.data)); // Float32Array -> plain array
    }
    return out;
}

(async () => {
    try {
        const pdfPath = process.argv[2];
        if (!pdfPath) {
            console.error('Usage: node scripts/ingest-mdw.js "<absolute path to PDF>"');
            process.exit(1);
        }

        // 1) Parse PDF
        const buf = fs.readFileSync(pdfPath);
        const parsed = await pdf(buf);
        const fullText = parsed.text || '';
        console.log(`PDF parsed (${fullText.length} chars)`);

        // 2) Chunk
        const chunks = chunkText(fullText, { chunkSize: 900, overlap: 150 });
        console.log(`Chunked into ${chunks.length} pieces. Computing local embeddings...`);

        // 3) Local embeddings
        const BATCH = 40;
        const allDocs = [];
        for (let i = 0; i < chunks.length; i += BATCH) {
            const batch = chunks.slice(i, i + BATCH);
            const embeddings = await embedBatchLocal(batch);
            batch.forEach((text, j) => {
                allDocs.push({
                    source: 'pdf',
                    title: DOC_TITLE,
                    chunkIndex: i + j,
                    text,
                    embedding: embeddings[j],
                    createdAt: new Date()
                });
            });
            console.log(`Embedded ${Math.min(i + BATCH, chunks.length)} / ${chunks.length}`);
        }

        // 4) Save to db = mdw_policy
        const policyConn = await mongoose.createConnection(MONGODB_URI_POLICY).asPromise();
        const MdwChunk = policyConn.model('MdwChunk', MdwChunkSchema);

        await MdwChunk.deleteMany({ source: 'pdf', title: DOC_TITLE });
        await MdwChunk.insertMany(allDocs);
        console.log(`Inserted ${allDocs.length} chunks into mdw_policy.mdw_chunks`);

        await policyConn.close();
        console.log('Ingest complete.');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
