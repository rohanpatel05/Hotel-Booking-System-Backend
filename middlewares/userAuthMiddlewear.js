import jwt from "jsonwebtoken";
import errorCodes from "../config/errorCodes.js";
import User from "../models/user.js";

const userAuthMiddleware = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res
      .status(errorCodes.BAD_REQUEST)
      .json({ message: "Missing access token" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(errorCodes.FORBIDDEN)
        .json({ message: "Could not verify access token" });
    } else {
      const user = await User.findById(decoded.userId);

      if (user === null) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "User not found" });
      } else {
        req.user = user;
        next();
      }
    }
  });
};

export default userAuthMiddleware;
