import express from 'express';
import roomController from '../controllers/roomControllers.js';

const router = express.Router();

let baseRoomURL = '/room';

router.get(baseRoomURL + '/', roomController.getAllRooms);
router.get(baseRoomURL + '/:id', roomController.getRoomById);
router.post(baseRoomURL + '/create', roomController.createRoom);
router.put(baseRoomURL + '/:id/update', roomController.updateRoom);
router.delete(baseRoomURL + '/:id/delete', roomController.deleteRoom);

export default router;
