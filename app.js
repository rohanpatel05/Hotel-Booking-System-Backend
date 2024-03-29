import express from "express";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/test", (req, res) => {
  res.json(req.body);
});

app.get("/test", (req, res) => {
  res.send("It's working!");
});

if (process.env.NODE_ENV !== "test") {
  await connectDB();
}

let baseUrl = "/api";
app.use(baseUrl, userRoutes);
app.use(baseUrl, roomRoutes);
app.use(baseUrl, bookingRoutes);
app.use(baseUrl, paymentRoutes);
app.use(errorHandlerMiddleware);

export default app;
