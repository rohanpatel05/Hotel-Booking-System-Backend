import express from "express";
import userController from "../controllers/userControllers.js";
import authControllers from "../controllers/authControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const baseUserUrl = "/user";

// Authentication routes
router.post("/signup", authControllers.signup);
router.post("/signin", authControllers.signin);
router.post("/signout", userAuthMiddleware, authControllers.signout);
router.post("/refresh", authControllers.refresh);

// User profile routes
router.get(
  baseUserUrl + "/user-info",
  userAuthMiddleware,
  userController.getUserInfo
);
router.put(
  baseUserUrl + "/update-profile",
  userAuthMiddleware,
  userController.updateUserProfile
);
router.put(
  baseUserUrl + "/change-password",
  userAuthMiddleware,
  userController.changePassword
);

export default router;
