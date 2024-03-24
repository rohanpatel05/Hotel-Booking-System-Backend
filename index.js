import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express(); 

app.use(express.json()); 
app.use(cors()); 

connectDB();

let baseUrl = "/api";
app.use(baseUrl, userRoutes);
app.use(baseUrl, roomRoutes);
app.use(baseUrl, bookingRoutes);
app.use(baseUrl, paymentRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
