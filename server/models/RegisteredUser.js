const mongoose = require('mongoose');

const RegisteredUserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('RegisteredUser', RegisteredUserSchema);
