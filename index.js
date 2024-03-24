import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import roomControllers from './controllers/roomControllers.js';


const app = express(); 

app.use(express.json()); 
app.use(cors()); 

connectDB();

let baseUrl = "/api";
app.use(baseUrl, userRoutes);
app.use(baseUrl, roomControllers);


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
