import mongoose from 'mongoose';
import 'dotenv/config';

const { MONGODB_URI }  = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); 
    }
};

export default connectDB;
