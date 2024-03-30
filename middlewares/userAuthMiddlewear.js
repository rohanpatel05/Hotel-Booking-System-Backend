import jwt from "jsonwebtoken";
import errorCodes from "../config/errorCodes.js";

const userAuthMiddleware = async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: "Missing access token" });
    } else {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res
            .status(errorCodes.FORBIDDEN)
            .json({ message: "Could not verify access token" });
        } else {
          req.user = decoded;
          next();
        }
      });
    }
  } else {
    return res
      .status(errorCodes.BAD_REQUEST)
      .json({ message: "Missing request header" });
  }
};

export default userAuthMiddleware;
