// server/routes/admin.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const staffOnly = require('../middleware/staffOnly');
const Helper = require('../models/Helper');
const RegisteredUser = require('../models/RegisteredUser');

// --- Upload deps/setup (MUST be before routes) ---
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, safe);
    },
});
const fileFilter = (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    if (!ok) return cb(new Error('Only JPG/PNG/WebP images are allowed'));
    cb(null, true);
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
});

/**
 * Helpers Admin CRUD
 * All routes require:
 *  - Valid JWT (auth())
 *  - Role = staff|admin (staffOnly)
 *
 * Response: { success: boolean, data?: any, error?: string, meta?: object }
 */

// GET /api/admin/helpers?q=&status=&page=&limit=
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
router.post('/helpers', auth(), staffOnly, async (req, res) => {
    try {
        const {
            name, age, nationality,
            experience = 0, skills = [],
            availability = true, expectedSalary = null,
        } = req.body || {};

        if (!name || !age || !nationality) {
            return res.status(400).json({ success: false, error: 'name, age, nationality are required' });
        }

        const doc = await Helper.create({
            name, age, nationality, experience, skills, availability, expectedSalary,
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        console.error('POST /admin/helpers error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// PUT /api/admin/helpers/:id
router.put('/helpers/:id', auth(), staffOnly, async (req, res) => {
    try {
        const allowed = ['name', 'age', 'nationality', 'experience', 'skills', 'availability', 'expectedSalary', 'photos'];
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

/**
 * Registered Users Admin CRUD
 */

// GET /api/admin/users?q=&page=&limit=
router.get('/users', auth(), staffOnly, async (req, res) => {
    try {
        const { q } = req.query;
        const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
        const limit = Math.max(Math.min(parseInt(req.query.limit ?? '20', 10), 100), 1);
        const skip = (page - 1) * limit;

        const filter = {};
        if (q) {
            const regex = new RegExp(String(q).trim(), 'i');
            filter.$or = [{ name: regex }, { email: regex }];
        }

        const [items, total] = await Promise.all([
            RegisteredUser.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
            RegisteredUser.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: items,
            meta: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
        });
    } catch (err) {
        console.error('GET /admin/users error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/admin/users/:id
router.get('/users/:id', auth(), staffOnly, async (req, res) => {
    try {
        const doc = await RegisteredUser.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        console.error('GET /admin/users/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/admin/users
router.post('/users', auth(), staffOnly, async (req, res) => {
    try {
        const { name, email, phone = '', address = '' } = req.body || {};
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'name and email are required' });
        }
        const doc = await RegisteredUser.create({ name, email, phone, address });
        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        console.error('POST /admin/users error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', auth(), staffOnly, async (req, res) => {
    try {
        const allowed = ['name', 'email', 'phone', 'address'];
        const patch = {};
        for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
        const doc = await RegisteredUser.findByIdAndUpdate(req.params.id, patch, { new: true });
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        console.error('PUT /admin/users/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth(), staffOnly, async (req, res) => {
    try {
        const doc = await RegisteredUser.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        return res.json({ success: true, data: { ok: true } });
    } catch (err) {
        console.error('DELETE /admin/users/:id error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

/* -------- Photo upload endpoints -------- */

// POST /api/admin/helpers/:id/photos  (field name: photos)
router.post('/helpers/:id/photos', auth(), staffOnly, upload.array('photos', 10), async (req, res) => {
    try {
        const helper = await Helper.findById(req.params.id);
        if (!helper) return res.status(404).json({ success: false, error: 'Helper not found' });

        const urls = (req.files || []).map(f => `/uploads/${f.filename}`);
        helper.photos = [...(helper.photos || []), ...urls];
        await helper.save();

        return res.json({ success: true, data: { photos: helper.photos } });
    } catch (err) {
        console.error('POST /admin/helpers/:id/photos error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// DELETE /api/admin/helpers/:id/photos  (body: { url })
router.delete('/helpers/:id/photos', auth(), staffOnly, async (req, res) => {
    try {
        const { url } = req.body || {};
        if (!url) return res.status(400).json({ success: false, error: 'url is required' });

        const helper = await Helper.findById(req.params.id);
        if (!helper) return res.status(404).json({ success: false, error: 'Helper not found' });

        helper.photos = (helper.photos || []).filter(u => u !== url);
        await helper.save();

        // best-effort local file remove
        if (url.startsWith('/uploads/')) {
            const filePath = path.join(UPLOAD_DIR, path.basename(url));
            if (fs.existsSync(filePath)) fs.unlink(filePath, () => { });
        }

        return res.json({ success: true, data: { photos: helper.photos } });
    } catch (err) {
        console.error('DELETE /admin/helpers/:id/photos error:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
