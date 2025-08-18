const jwt = require('jsonwebtoken');

module.exports = (roles = []) => (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
        if (roles.length && !roles.includes(payload.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = payload;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
