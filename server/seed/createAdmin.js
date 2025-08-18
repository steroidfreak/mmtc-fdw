require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Minimal User model inline (uses same shape as your app) ---
const UserSchema = new mongoose.Schema({
    role: { type: String, enum: ['admin', 'staff', 'employer'], default: 'employer', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- Helpers ---
function die(msg) { console.error('❌', msg); process.exit(1); }
function ok(msg) { console.log('✅', msg); }

// --- Args: node seed/createAdmin.js <email> <password> [name] [role] ---
(async () => {
    const [, , email, password, nameArg, roleArg] = process.argv;

    if (!email || !password) {
        die('Usage: node seed/createAdmin.js <email> <password> [name="Admin User"] [role="admin"|"staff"]');
    }

    const name = nameArg || 'Admin User';
    const role = (roleArg === 'staff' ? 'staff' : 'admin');

    // Basic email sanity
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) die('Invalid email format');

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mmtc_fdw';
    try {
        await mongoose.connect(MONGO_URI);
        ok(`Connected to MongoDB: ${MONGO_URI}`);

        const hash = await bcrypt.hash(password, 10);

        // Upsert: create if missing, or update role+password if exists
        const user = await User.findOne({ email });

        if (!user) {
            const created = await User.create({
                name,
                email,
                role,
                passwordHash: hash
            });
            ok(`Created ${role} user: ${created.email}`);
        } else {
            user.name = name || user.name;
            user.role = role;
            user.passwordHash = hash;
            await user.save();
            ok(`Updated existing user to role=${role}: ${user.email}`);
        }

        const result = await User.findOne({ email }).select('name email role createdAt updatedAt');
        console.log('→', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        die(err.message || 'Failed to create admin');
    }
})();
