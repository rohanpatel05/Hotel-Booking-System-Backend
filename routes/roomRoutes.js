import express from "express";
import roomController from "../controllers/roomControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";
import mockAuthMiddleware from "../middlewares/mockAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

const baseRoomURL = "/room";

const authMiddleware =
  process.env.NODE_ENV === "test" ? mockAuthMiddleware : userAuthMiddleware;

router.get(baseRoomURL + "/", roomController.getAllRooms);
router.get(baseRoomURL + "/by-id/:userId", roomController.getRoomById);
router.post(
  baseRoomURL + "/create",
  authMiddleware,
  adminAuthMiddleware,
  roomController.createRoom
);
router.put(
  baseRoomURL + "/update/:userId",
  authMiddleware,
  adminAuthMiddleware,
  roomController.updateRoom
);
router.delete(
  baseRoomURL + "/delete/:userId",
  authMiddleware,
  adminAuthMiddleware,
  roomController.deleteRoom
);

export default router;
