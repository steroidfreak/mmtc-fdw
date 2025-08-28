const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

(async function seedAdmin() {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD || 'password123';
        const name = process.env.ADMIN_NAME || 'Admin User';

        let user = await User.findOne({ email });
        const hash = await bcrypt.hash(password, 10);

        if (!user) {
            await User.create({ name, email, role: 'admin', passwordHash: hash });
            console.log(`✅ Created admin user: ${email}`);
        } else {
            user.name = name;
            user.role = 'admin';
            user.passwordHash = hash;
            await user.save();
            console.log(`✅ Updated admin user: ${email}`);
        }
    } catch (err) {
        console.error('❌ Seeding admin failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
