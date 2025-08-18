require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Helper = require('../models/Helper');

const seedHelpers = async () => {
    try {
        await connectDB();

        await Helper.deleteMany(); // Clear old data

        const helpers = [
            {
                name: 'Aye Aye',
                age: 28,
                nationality: 'Myanmar',
                experience: 3,
                skills: ['Cooking', 'Childcare'],
                expectedSalary: 600
            },
            {
                name: 'Siti',
                age: 32,
                nationality: 'Indonesian',
                experience: 5,
                skills: ['Elderly Care', 'Housekeeping'],
                expectedSalary: 650
            },
            {
                name: 'Maria',
                age: 26,
                nationality: 'Filipino',
                experience: 2,
                skills: ['Pet Care', 'Cooking'],
                expectedSalary: 550
            }
        ];

        await Helper.insertMany(helpers);

        console.log('✅ Seeded helpers successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedHelpers();
