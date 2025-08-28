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
            { name: 'Nandar', age: 30, nationality: 'Myanmar', experience: 4, skills: ['Cooking', 'Elderly Care'], expectedSalary: 620, availability: true, photos: [] },
            { name: 'Indah', age: 24, nationality: 'Indonesia', experience: 1, skills: ['Childcare', 'Housekeeping'], expectedSalary: 500, availability: true, photos: [] },
            { name: 'Rose', age: 35, nationality: 'Philippines', experience: 10, skills: ['Elderly Care', 'Cooking', 'Housekeeping'], expectedSalary: 750, availability: true, photos: [] },
            { name: 'Mya', age: 29, nationality: 'Myanmar', experience: 6, skills: ['Pet Care', 'Cooking'], expectedSalary: 680, availability: false, photos: [] },
            { name: 'Ani', age: 27, nationality: 'Indonesia', experience: 3, skills: ['Childcare', 'Cooking'], expectedSalary: 600, availability: true, photos: [] },
            { name: 'Liza', age: 31, nationality: 'Philippines', experience: 7, skills: ['Elderly Care', 'Pet Care'], expectedSalary: 700, availability: true, photos: [] },
            { name: 'Thandar', age: 25, nationality: 'Myanmar', experience: 2, skills: ['Housekeeping'], expectedSalary: 520, availability: true, photos: [] },
            { name: 'Putri', age: 34, nationality: 'Indonesia', experience: 8, skills: ['Cooking', 'Childcare'], expectedSalary: 720, availability: false, photos: [] },
            { name: 'Joan', age: 29, nationality: 'Philippines', experience: 5, skills: ['Cooking', 'Housekeeping'], expectedSalary: 650, availability: true, photos: [] },
            { name: 'Hnin', age: 23, nationality: 'Myanmar', experience: 1, skills: ['Childcare'], expectedSalary: 480, availability: true, photos: [] },
            { name: 'Dewi', age: 28, nationality: 'Indonesia', experience: 4, skills: ['Cooking', 'Pet Care'], expectedSalary: 620, availability: true, photos: [] },
            { name: 'Arlene', age: 36, nationality: 'Philippines', experience: 12, skills: ['Elderly Care', 'Cooking', 'Housekeeping', 'Childcare'], expectedSalary: 800, availability: true, photos: [] },
            { name: 'Su Su', age: 33, nationality: 'Myanmar', experience: 7, skills: ['Cooking', 'Housekeeping'], expectedSalary: 700, availability: true, photos: [] },
            { name: 'Yanti', age: 26, nationality: 'Indonesia', experience: 2, skills: ['Childcare', 'Housekeeping'], expectedSalary: 550, availability: false, photos: [] },
            { name: 'Clarissa', age: 30, nationality: 'Philippines', experience: 6, skills: ['Cooking', 'Elderly Care'], expectedSalary: 680, availability: true, photos: [] },
            { name: 'May', age: 27, nationality: 'Myanmar', experience: 3, skills: ['Cooking', 'Pet Care'], expectedSalary: 600, availability: true, photos: [] },
            { name: 'Sri', age: 29, nationality: 'Indonesia', experience: 4, skills: ['Childcare', 'Cooking'], expectedSalary: 620, availability: true, photos: [] },
            { name: 'Angela', age: 25, nationality: 'Philippines', experience: 2, skills: ['Housekeeping'], expectedSalary: 520, availability: true, photos: [] },
            { name: 'Khin', age: 34, nationality: 'Myanmar', experience: 8, skills: ['Elderly Care', 'Cooking'], expectedSalary: 730, availability: true, photos: [] },
            { name: 'Rina', age: 31, nationality: 'Indonesia', experience: 6, skills: ['Pet Care', 'Cooking'], expectedSalary: 670, availability: false, photos: [] },
            { name: 'Sophia', age: 28, nationality: 'Philippines', experience: 4, skills: ['Cooking', 'Childcare'], expectedSalary: 600, availability: true, photos: [] },
            { name: 'Htet', age: 22, nationality: 'Myanmar', experience: 1, skills: ['Housekeeping'], expectedSalary: 480, availability: true, photos: [] },
            { name: 'Mega', age: 27, nationality: 'Indonesia', experience: 3, skills: ['Childcare'], expectedSalary: 550, availability: true, photos: [] },
            { name: 'Jean', age: 33, nationality: 'Philippines', experience: 9, skills: ['Elderly Care', 'Cooking', 'Housekeeping'], expectedSalary: 750, availability: true, photos: [] },
            { name: 'Chaw', age: 29, nationality: 'Myanmar', experience: 5, skills: ['Cooking', 'Childcare'], expectedSalary: 650, availability: false, photos: [] },
            { name: 'Fitri', age: 24, nationality: 'Indonesia', experience: 2, skills: ['Pet Care'], expectedSalary: 500, availability: true, photos: [] },
            { name: 'Grace', age: 30, nationality: 'Philippines', experience: 6, skills: ['Housekeeping', 'Cooking'], expectedSalary: 670, availability: true, photos: [] },
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
