import express from "express";
import roomController from "../controllers/roomControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const baseRoomURL = "/room";

router.get(baseRoomURL + "/", roomController.getAllRooms);
router.get(baseRoomURL + "/by-id/:userId", roomController.getRoomById);
router.post(
  baseRoomURL + "/create",
  userAuthMiddleware,
  roomController.createRoom
);
router.put(
  baseRoomURL + "/update/:userId",
  userAuthMiddleware,
  roomController.updateRoom
);
router.delete(
  baseRoomURL + "/delete/:userId",
  userAuthMiddleware,
  roomController.deleteRoom
);

export default router;
