import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/users.js'


const app = express(); 

app.use(express.json()); 
app.use(cors()); 

connectDB();

let baseUrl = "/api";
app.use(baseUrl, userRoutes);


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
