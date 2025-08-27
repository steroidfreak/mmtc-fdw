const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Helper = require('../models/Helper');

(async function seedHelpers() {
    try {
        await connectDB();

        await Helper.deleteMany({});

        const helpers = [
            { name: 'Aye Aye', age: 28, nationality: 'Myanmar', experience: 3, skills: ['Cooking', 'Childcare'], expectedSalary: 600, availability: true, photos: [] },
            { name: 'Siti', age: 32, nationality: 'Indonesia', experience: 5, skills: ['Elderly Care', 'Housekeeping'], expectedSalary: 650, availability: true, photos: [] },
            { name: 'Maria', age: 26, nationality: 'Philippines', experience: 2, skills: ['Pet Care', 'Cooking'], expectedSalary: 550, availability: false, photos: [] },
        ];

        await Helper.insertMany(helpers);
        console.log('✅ Seeded helpers successfully');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
