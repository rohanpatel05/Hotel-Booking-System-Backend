import express from 'express';
import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import errorHandlerMiddleware from './middlewares/errorHandler.js';

const app = express(); 

app.use(express.json()); 
app.use(cors()); 

connectDB();

let baseUrl = "/api";
app.use(baseUrl, userRoutes);
app.use(baseUrl, roomRoutes);
app.use(baseUrl, bookingRoutes);
app.use(baseUrl, paymentRoutes);
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing server...');
  server.close(() => {
      console.log('Server closed');
      disconnectDB();
      process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing server...');
  server.close(() => {
      console.log('Server closed');
      disconnectDB(); 
      process.exit(0);
  });
});