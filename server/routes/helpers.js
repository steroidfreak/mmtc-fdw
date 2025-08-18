const router = require('express').Router();
const Helper = require('../models/Helper');

// GET /api/helpers
// Query params: q (name), nationality, skill, available=true/false,
// minExp, maxSalary, page=1, limit=20, sort=updatedAt:-1
router.get('/', async (req, res) => {
    const {
        q,
        nationality,
        skill,
        available,
        minExp,
        maxSalary,
        page = 1,
        limit = 20,
        sort = 'updatedAt:-1',
    } = req.query;

    const filter = {};
    if (q) filter.name = new RegExp(q.trim(), 'i');
    if (nationality) filter.nationality = nationality.trim();
    if (skill) filter.skills = { $in: skill.split(',').map(s => s.trim()).filter(Boolean) };
    if (available === 'true') filter.availability = true;
    if (available === 'false') filter.availability = false;
    if (minExp) filter.experience = { ...(filter.experience || {}), $gte: Number(minExp) };
    if (maxSalary) filter.expectedSalary = { ...(filter.expectedSalary || {}), $lte: Number(maxSalary) };

    // sort parser: e.g. "updatedAt:-1" or "expectedSalary:1"
    const [sortField, sortDirRaw] = String(sort).split(':');
    const sortSpec = sortField ? { [sortField]: Number(sortDirRaw) || -1 } : { updatedAt: -1 };

    const skip = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);

    const [items, total] = await Promise.all([
        Helper.find(filter).sort(sortSpec).skip(skip).limit(pageSize),
        Helper.countDocuments(filter),
    ]);

    res.json({
        items,
        page: Number(page),
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
    });
});

// GET /api/helpers/:id
router.get('/:id', async (req, res) => {
    const doc = await Helper.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
});

// POST /api/helpers  (simple admin/staff create; add auth later)
router.post('/', async (req, res) => {
    const payload = req.body || {};
    const doc = await Helper.create(payload);
    res.status(201).json(doc);
});

// PUT /api/helpers/:id  (update)
router.put('/:id', async (req, res) => {
    const doc = await Helper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
});

module.exports = router;
