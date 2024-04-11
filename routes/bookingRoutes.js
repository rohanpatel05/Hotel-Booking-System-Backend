import express from "express";
import bookingController from "../controllers/bookingControllers.js";

const router = express.Router();

const baseBookingUrl = "/booking";

router.post(baseBookingUrl + "/:roomId/book", bookingController.bookRoom);
router.get(baseBookingUrl + "/", bookingController.getAllBookings);
router.get(baseBookingUrl + "/:id", bookingController.getBookingById);
router.put(baseBookingUrl + "/:id/cancel", bookingController.cancelBooking);

export default router;
