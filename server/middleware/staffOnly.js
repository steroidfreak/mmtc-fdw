module.exports = function staffOnly(req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
};
