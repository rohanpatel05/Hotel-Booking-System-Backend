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
router.get(baseBookingUrl + "/", bookingController.getAllBookings);
router.get(baseBookingUrl + "/:bookingId", bookingController.getBookingById);
router.put(
  baseBookingUrl + "/cancel/:bookingId",
  userAuthMiddleware,
  bookingController.cancelBooking
);
router.post(
  baseBookingUrl + "/checkAvailability",
  bookingController.checkAvailability
);

export default router;
