const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const uri = process.env.MONGO_URI;
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('Mongo (Mongoose) connected');
};
