const express = require('express');
const OpenAI = require('openai');
const Helper = require('../models/Helper');

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Prepare headers for streaming text response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');

    try {
        const isHelperQuery = /helper|maid/i.test(message);

        if (!isHelperQuery) {
            // General assistant mode
            const stream = await openai.chat.completions.create({
                model: 'gpt-5',
                messages: [{ role: 'user', content: message }],
                stream: true,
            });

            for await (const part of stream) {
                const token = part.choices[0]?.delta?.content || '';
                res.write(token);
            }
            return res.end();
        }

        // Helper search mode
        const analysis = await openai.chat.completions.create({
            model: 'gpt-5',
            messages: [
                {
                    role: 'system',
                    content:
                        'Extract helper search criteria from the following user message and respond as JSON with keys: nationality, minAge, maxAge, minExperience, skills (array). If not specified, use null.',
                },
                { role: 'user', content: message },
            ],
            response_format: { type: 'json_object' },
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
        const summary = helpers
            .map(h => `${h.name}, ${h.age} years old ${h.nationality}, skills: ${h.skills.join(', ')}`)
            .join('\n');

        const stream = await openai.chat.completions.create({
            model: 'gpt-5',
            messages: [
                {
                    role: 'user',
                    content: `User request: ${message}\n\nHelpers:\n${summary}\n\nExplain concisely why these helpers match the request.`,
                },
            ],
            stream: true,
        });

        for await (const part of stream) {
            const token = part.choices[0]?.delta?.content || '';
            res.write(token);
        }

        const helperLines = helpers
            .map(h => `${h.name} (${h.nationality}) - ${h.skills.join(', ')}`)
            .join('\n');
        res.write(`\n\n${helperLines}`);
        return res.end();
    } catch (err) {
        console.error(err);
        res.status(500);
        res.write('Sorry, I could not get recommendations.');
        return res.end();
    }
});

module.exports = router;
