import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';

const app = express(); 

app.use(express.json()); 
app.use(cors()); 

connectDB();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
