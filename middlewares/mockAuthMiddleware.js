import User from "../models/user.js";

const mockAuthMiddleware = async (req, res, next) => {
  let user = await User.findOne({ email: "test@example.com" });
  if (!user) {
    user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    });
    await user.save();
  }
  req.user = user;
  next();
};

export default mockAuthMiddleware;
