module.exports = function staffOnly(req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff' && role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
};
