const router = require('express').Router();
const { Schema, model, Types } = require('mongoose');
const auth = require('../middleware/auth');
const Helper = require('../models/Helper');

// Job schema
const Job = model('Job', new Schema({
    employerId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
    shortlist: [{ type: Types.ObjectId, ref: 'Helper' }]
}, { timestamps: true }));

// Ensure employer always has an active job
async function ensureActiveJob(userId) {
    let job = await Job.findOne({ employerId: userId, status: 'active' });
    if (!job) job = await Job.create({ employerId: userId });
    return job;
}

// --- Routes ---
router.get('/active', auth(['employer', 'admin', 'staff']), async (req, res) => {
    res.json(await ensureActiveJob(req.user.id));
});

router.get('/active/shortlist', auth(['employer', 'admin', 'staff']), async (req, res) => {
    const job = await ensureActiveJob(req.user.id);
    const populated = await Job.findById(job._id).populate('shortlist');
    res.json({ jobId: job._id, shortlist: populated.shortlist || [] });
});

router.post('/active/shortlist', auth(['employer', 'admin', 'staff']), async (req, res) => {
    const { helperId } = req.body || {};
    if (!helperId) return res.status(400).json({ error: 'helperId required' });
    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });

    const job = await ensureActiveJob(req.user.id);
    if (!job.shortlist.some(id => String(id) === String(helperId))) {
        job.shortlist.push(helperId);
        await job.save();
    }
    res.json({ ok: true, jobId: job._id, shortlist: job.shortlist });
});

router.delete('/active/shortlist/:helperId', auth(['employer', 'admin', 'staff']), async (req, res) => {
    const job = await ensureActiveJob(req.user.id);
    job.shortlist = job.shortlist.filter(id => String(id) !== String(req.params.helperId));
    await job.save();
    res.json({ ok: true, jobId: job._id, shortlist: job.shortlist });
});

module.exports = router;
