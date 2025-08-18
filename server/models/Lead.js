const { Schema, model, Types } = require('mongoose');

const LeadSchema = new Schema({
    employerId: { type: Types.ObjectId, ref: 'User', index: true }, // who requested
    helperId: { type: Types.ObjectId, ref: 'Helper', index: true }, // about whom
    preferredTime: { type: Date },   // optional
    message: { type: String, trim: true },
    contact: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true }
    },
    source: { type: String, default: 'helper_detail' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true }
}, { timestamps: true });

module.exports = model('Lead', LeadSchema);
