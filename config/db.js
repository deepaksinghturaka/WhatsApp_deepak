const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const fallbackUri = 'mongodb://localhost:27017/whatsapp';
        const uri = process.env.MONGODB_URI || fallbackUri;

        console.log('Connecting to MongoDB using:', uri);

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        console.error('Please check if MongoDB is running locally or your connection string is valid.');
        process.exit(1);
    }
};

module.exports = connectDB;
