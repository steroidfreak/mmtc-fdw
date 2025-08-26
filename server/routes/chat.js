const express = require('express');
const OpenAI = require('openai');
const Helper = require('../models/Helper');

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const analysis = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: `Extract helper search criteria from the following user message and respond as JSON with keys: nationality, minAge, maxAge, minExperience, skills (array). If not specified, use null.\n\n${message}`
        });
        let filters = {};
        try {
            filters = JSON.parse(analysis.output_text);
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

        const summary = helpers.map(h => `${h.name}, ${h.age} years old ${h.nationality}, skills: ${h.skills.join(', ')}`).join('\n');
        const explanationRes = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: `User request: ${message}\n\nHelpers:\n${summary}\n\nExplain concisely why these helpers match the request.`
        });

        res.json({ helpers, explanation: explanationRes.output_text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get recommendation' });
    }
});

module.exports = router;
