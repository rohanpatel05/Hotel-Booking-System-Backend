import dotenv from "dotenv";

dotenv.config();

const config = {
  jwtSecret: process.env.ACCESS_TOKEN_SECRET,
};

export default config;
