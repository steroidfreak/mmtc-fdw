const router = require('express').Router();
const Lead = require('../models/Lead');
const Helper = require('../models/Helper');
const auth = require('../middleware/auth');

// Create a lead (interview request)
router.post('/', auth(['employer', 'admin', 'staff']), async (req, res) => {
    const { helperId, preferredTime, message, contact } = req.body || {};
    if (!helperId) return res.status(400).json({ error: 'helperId required' });

    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });

    if (!contact?.phone && !contact?.email) {
        return res.status(400).json({ error: 'Provide phone or email' });
    }

    const lead = await Lead.create({
        employerId: req.user.id,
        helperId,
        preferredTime: preferredTime ? new Date(preferredTime) : undefined,
        message,
        contact,
    });

    res.json({ ok: true, leadId: lead._id });
});

// List my leads (employer)
router.get('/my', auth(['employer', 'admin', 'staff']), async (req, res) => {
    const list = await Lead.find({ employerId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('helperId', 'name nationality skills experience');
    res.json(list);
});

module.exports = router;
