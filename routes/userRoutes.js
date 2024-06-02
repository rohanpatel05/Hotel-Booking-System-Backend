import express from "express";
import userController from "../controllers/userControllers.js";
import userExistMiddleware from "../middlewares/userExistMiddlewear.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const baseUserUrl = "/user";

// Authentication routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userAuthMiddleware, userController.logout);
router.post("/refresh", userController.refresh);

// User profile routes
router.get(baseUserUrl + "/user-info/:userId", userController.getUserInfo);
router.put(
  baseUserUrl + "/update-profile/:userId",
  userAuthMiddleware,
  userController.updateUserProfile
);
router.put(
  baseUserUrl + "/change-password/:userId",
  userExistMiddleware,
  userAuthMiddleware,
  userController.changePassword
);

export default router;
