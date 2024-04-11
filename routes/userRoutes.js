import express from "express";
import userController from "../controllers/userControllers.js";
import userExistMiddleware from "../middlewares/userExistMiddlewear.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const baseUserUrl = "/user";

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/logout", userAuthMiddleware, userController.logout);
router.put("/refresh", userController.refresh);

// User profile routes
router.put(
  baseUserUrl + "/updateProfile/:userId",
  userAuthMiddleware,
  userController.updateUserProfile
);
router.put(
  baseUserUrl + "/changePassword/:userId",
  userExistMiddleware,
  userAuthMiddleware,
  userController.changePassword
);

export default router;
