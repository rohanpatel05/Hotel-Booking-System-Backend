import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';

const app = express(); 

connectDB();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
