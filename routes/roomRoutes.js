import express from "express";
import roomController from "../controllers/roomControllers.js";

const router = express.Router();

const baseRoomURL = "/room";

router.get(baseRoomURL + "/", roomController.getAllRooms);
router.get(baseRoomURL + "/by-id/:userId", roomController.getRoomById);
router.post(baseRoomURL + "/create", roomController.createRoom);
router.put(baseRoomURL + "/update/:userId", roomController.updateRoom);
router.delete(baseRoomURL + "/delete/:userId", roomController.deleteRoom);

export default router;
