const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sign(u) {
    const secret = process.env.JWT_SECRET || 'change_me';
    return jwt.sign({ id: u._id, name: u.name, email: u.email, role: u.role }, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const u = new User({ name, email, phone });
    await u.setPassword(password);
    await u.save();
    res.json({ token: sign(u) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    const u = await User.findOne({ email });
    if (!u || !(await u.comparePassword(password))) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }
    res.json({ token: sign(u) });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const token = (req.headers.authorization || '').replace('Bearer ', '');
        const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'change_me');
        const u = await User.findById(payload.id).select('-passwordHash');
        if (!u) return res.status(404).json({ error: 'Not found' });
        res.json(u);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
