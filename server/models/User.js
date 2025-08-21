const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    role: { type: String, enum: ['admin', 'staff', 'employer'], default: 'employer', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String }
}, { timestamps: true });

UserSchema.methods.setPassword = async function (pw) {
    this.passwordHash = await bcrypt.hash(pw, 10);
};
UserSchema.methods.comparePassword = function (pw) {
    return bcrypt.compare(pw, this.passwordHash);
};

module.exports = model('User', UserSchema);
