const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    photos: [String], // e.g. "/uploads/171345-myfile.jpg"
    nationality: { type: String, required: true },
    experience: { type: Number, default: 0 }, // years
    skills: [String], // e.g. ["Cooking", "Childcare"]
    availability: { type: Boolean, default: true },
    expectedSalary: Number,
}, { timestamps: true });

module.exports = mongoose.model('Helper', helperSchema);
