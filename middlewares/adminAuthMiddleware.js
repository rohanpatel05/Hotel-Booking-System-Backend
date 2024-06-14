import errorCodes from "../config/errorCodes.js";

const adminAuthMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(errorCodes.FORBIDDEN)
      .json({ message: "Access denied. Admins only." });
  }
  next();
};

export default adminAuthMiddleware;
