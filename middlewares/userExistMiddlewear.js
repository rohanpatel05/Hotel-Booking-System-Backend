import User from "../models/user.js";
import errorCodes from "../config/errorCodes.js";

const userExistMiddleware = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (user === null) {
    return res.status(errorCodes.NOT_FOUND).json({ message: "User not found" });
  } else {
    res.locals.user = user;
    next();
  }
};

export default userExistMiddleware;
