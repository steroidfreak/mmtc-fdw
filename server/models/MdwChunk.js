// models/MdwChunk.js
const mongoose = require('mongoose');

const MdwChunkSchema = new mongoose.Schema({
    source: { type: String, default: 'pdf' },
    title: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'mdw_chunks' });

module.exports = mongoose.model('MdwChunk', MdwChunkSchema);
