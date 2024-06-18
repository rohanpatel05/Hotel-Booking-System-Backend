import errorCodes from "../config/errorCodes.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import "dotenv/config";
import bcrypt from "bcrypt";

const nameRegex = /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/;
const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "7d";
const accessTokenMaxAge = 15 * 60 * 1000; // 15 mins in ms
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const setTokensAsCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: accessTokenMaxAge,
    secure: true,
    sameSite: "None",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: refreshTokenMaxAge,
    secure: true,
    sameSite: "None",
  });
};

const clearTokens = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

const authControllers = {
  async signup(req, res, next) {
    try {
      const { name = "", email = "", password = "" } = req.body;

      if (!name || !email || !password) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Name, email, and password are required" });
      }
      if (!nameRegex.test(name)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid name format" });
      }
      if (!emailRegex.test(email)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid email format" });
      }
      if (!passwordRegex.test(password)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid password format" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "User already exists with this email" });
      }

      const newUser = new User({ name, email, password });
      await newUser.save();

      const user = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };

      const accessToken = jwt.sign(
        { userId: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiresIn }
      );
      const refreshToken = jwt.sign(
        { userId: newUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiresIn }
      );

      setTokensAsCookies(res, accessToken, refreshToken);

      return res
        .status(201)
        .json({ message: "User created successfully", user });
    } catch (error) {
      next(error);
    }
  },
  async signin(req, res, next) {
    try {
      const { email = "", password = "" } = req.body;

      if (!email || !password) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Email and password are required" });
      }
      if (!emailRegex.test(email)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid email format" });
      }
      if (!passwordRegex.test(password)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid password format" });
      }

      const userInfo = await User.findOne({ email });
      if (!userInfo) {
        return res
          .status(errorCodes.UNAUTHORIZED)
          .json({ message: "User not registered" });
      }

      const passwordMatch = await bcrypt.compare(password, userInfo.password);
      if (!passwordMatch) {
        return res
          .status(errorCodes.UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
      }

      const user = {
        _id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
      };

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiresIn }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiresIn }
      );

      setTokensAsCookies(res, accessToken, refreshToken);

      return res.status(200).json({ message: "Login successful", user });
    } catch (error) {
      next(error);
    }
  },
  async signout(req, res, next) {
    try {
      clearTokens(res);
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  },
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Refresh token is required" });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res
              .status(errorCodes.UNAUTHORIZED)
              .json({ message: "Invalid refresh token" });
          }

          const user = await User.findById(decoded.userId);
          if (!user) {
            return res
              .status(errorCodes.NOT_FOUND)
              .json({ message: "User not found" });
          }

          const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: accessTokenExpiresIn }
          );

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            maxAge: accessTokenMaxAge,
            secure: true,
            sameSite: "None",
          });

          return res
            .status(200)
            .json({ message: "Access token refreshed successfully" });
        }
      );
    } catch (error) {
      next(error);
    }
  },
};

export default authControllers;
