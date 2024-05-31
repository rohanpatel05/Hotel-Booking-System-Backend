import express from "express";
import bookingController from "../controllers/bookingControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const baseBookingUrl = "/booking";

router.post(
  baseBookingUrl + "/book",
  userAuthMiddleware,
  bookingController.bookRoom
);
router.get(
  baseBookingUrl + "/get-all-bookings",
  bookingController.getAllBookings
);
router.get(
  baseBookingUrl + "/by-id/:bookingId",
  bookingController.getBookingById
);
router.get(
  baseBookingUrl + "/by-user",
  userAuthMiddleware,
  bookingController.getBookingByUserID
);
router.put(
  baseBookingUrl + "/cancel/:bookingId",
  userAuthMiddleware,
  bookingController.cancelBooking
);
router.post(
  baseBookingUrl + "/check-availability",
  bookingController.checkAvailability
);

export default router;
