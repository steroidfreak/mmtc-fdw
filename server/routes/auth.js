const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch {
    nodemailer = null;
}
const User = require('../models/User');

async function sendVerification(email, token) {
    const url = `http://localhost:4000/api/auth/verify?token=${token}`;
    if (!nodemailer) {
        console.log('Verify at:', url);
        return;
    }
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({
        from: 'no-reply@example.com',
        to: email,
        subject: 'Verify your email',
        html: `<a href="${url}">Verify Email</a>`,
        text: `Verify your email: ${url}`
    });
    console.log('Verification email:', nodemailer.getTestMessageUrl(info));
}

async function sendPasswordReset(email, token) {
    const url = `http://localhost:5173/reset-password?token=${token}`;
    if (!nodemailer) {
        console.log('Reset at:', url);
        return;
    }
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({
        from: 'no-reply@example.com',
        to: email,
        subject: 'Reset your password',
        html: `<a href="${url}">Reset Password</a>`,
        text: `Reset your password: ${url}`
    });
    console.log('Password reset email:', nodemailer.getTestMessageUrl(info));
}

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
    const token = crypto.randomBytes(32).toString('hex');
    const u = new User({ name, email, phone, verificationToken: token });
    await u.setPassword(password);
    await u.save();
    await sendVerification(email, token);
    res.json({ message: 'Check your email to verify your account' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    const u = await User.findOne({ email });
    if (!u || !(await u.comparePassword(password))) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }
    if (!u.verified) {
        return res.status(403).json({ error: 'Email not verified' });
    }
    res.json({ token: sign(u) });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const u = await User.findOne({ email });
    if (!u) return res.json({ message: 'If the email exists, a reset link has been sent' });
    const token = crypto.randomBytes(32).toString('hex');
    u.passwordResetToken = token;
    u.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await u.save();
    await sendPasswordReset(email, token);
    res.json({ message: 'If the email exists, a reset link has been sent' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });
    const u = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
    });
    if (!u) return res.status(400).json({ error: 'Invalid or expired token' });
    await u.setPassword(password);
    u.passwordResetToken = undefined;
    u.passwordResetExpires = undefined;
    await u.save();
    res.json({ message: 'Password reset successful' });
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

// GET /api/auth/verify
router.get('/verify', async (req, res) => {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ error: 'Missing token' });
    const u = await User.findOne({ verificationToken: token });
    if (!u) return res.status(400).json({ error: 'Invalid token' });
    u.verified = true;
    u.verificationToken = undefined;
    await u.save();
    res.json({ message: 'Email verified' });
});
