import mongoose from 'mongoose';
import 'dotenv/config';

const { MONGODB_URI }  = process.env;

const connectDB = async () => {

    mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to the DB!');
    })
    .catch(err => {
        console.error('Error connecting to the DB:', err);
        process.exit(1);
    });
};

export default connectDB;
