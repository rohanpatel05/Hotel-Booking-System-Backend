import express from "express";
import userController from "../controllers/userControllers.js";
import authControllers from "../controllers/authControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";
import mockAuthMiddleware from "../middlewares/mockAuthMiddleware.js";

const router = express.Router();

const baseUserUrl = "/user";

const authMiddleware =
  process.env.NODE_ENV === "test" ? mockAuthMiddleware : userAuthMiddleware;

// Authentication routes
router.post("/signup", authControllers.signup);
router.post("/signin", authControllers.signin);
router.post("/signout", authMiddleware, authControllers.signout);
router.post("/refresh", authControllers.refresh);

// User profile routes
router.get(
  baseUserUrl + "/user-info",
  authMiddleware,
  userController.getUserInfo
);
router.put(
  baseUserUrl + "/update-profile",
  authMiddleware,
  userController.updateUserProfile
);
router.put(
  baseUserUrl + "/change-password",
  authMiddleware,
  userController.changePassword
);

export default router;
