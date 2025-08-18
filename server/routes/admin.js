// server/routes/admin.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const staffOnly = require('../middleware/staffOnly');
const Helper = require('../models/Helper');

/**
 * Helpers Admin CRUD
 * All routes require:
 *  - Valid JWT (auth())
 *  - Role = staff|admin (staffOnly)
 *
 * Response shape (consistent):
 *  { success: boolean, data?: any, error?: string, meta?: object }
 */

// GET /api/admin/helpers?q=&status=&page=&limit=
// List helpers with simple filters + pagination
router.get('/helpers', auth(), staffOnly, async (req, res) => {
    try {
        const { q, status } = req.query;
        const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
        const limit = Math.max(Math.min(parseInt(req.query.limit ?? '20', 10), 100), 1);
        const skip = (page - 1) * limit;

        const filter = {};
        if (q) filter.name = new RegExp(String(q).trim(), 'i');
        if (status === 'available') filter.availability = true;
        if (status === 'not') filter.availability = false;

        const [items, total] = await Promise.all([
            Helper.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
            Helper.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: items,
            meta: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
        });
    } catch (err) {
        console.error('GET /admin/helpers error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/admin/helpers/:id
// Read one helper
router.get('/helpers/:id', auth(), staffOnly, async (req, res) => {
    try {
        const doc = await Helper.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        console.error('GET /admin/helpers/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/admin/helpers
// Create helper
router.post('/helpers', auth(), staffOnly, async (req, res) => {
    try {
        const {
            name,
            age,
            nationality,
            experience = 0,
            skills = [],
            availability = true,
            expectedSalary = null,
        } = req.body || {};

        if (!name || !age || !nationality) {
            return res
                .status(400)
                .json({ success: false, error: 'name, age, nationality are required' });
        }

        const doc = await Helper.create({
            name,
            age,
            nationality,
            experience,
            skills,
            availability,
            expectedSalary,
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        console.error('POST /admin/helpers error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// PUT /api/admin/helpers/:id
// Update helper (whitelisted fields)
router.put('/helpers/:id', auth(), staffOnly, async (req, res) => {
    try {
        const allowed = [
            'name',
            'age',
            'nationality',
            'experience',
            'skills',
            'availability',
            'expectedSalary',
        ];
        const patch = {};
        for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

        const doc = await Helper.findByIdAndUpdate(req.params.id, patch, { new: true });
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });

        return res.json({ success: true, data: doc });
    } catch (err) {
        console.error('PUT /admin/helpers/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// DELETE /api/admin/helpers/:id
// Hard delete helper
router.delete('/helpers/:id', auth(), staffOnly, async (req, res) => {
    try {
        const doc = await Helper.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        return res.json({ success: true, data: { ok: true } });
    } catch (err) {
        console.error('DELETE /admin/helpers/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
