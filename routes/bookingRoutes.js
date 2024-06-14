import express from "express";
import bookingController from "../controllers/bookingControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";
import mockAuthMiddleware from "../middlewares/mockAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

const baseBookingUrl = "/booking";

const authMiddleware =
  process.env.NODE_ENV === "test" ? mockAuthMiddleware : userAuthMiddleware;

router.post(
  baseBookingUrl + "/book",
  authMiddleware,
  bookingController.bookRoom
);
router.get(
  baseBookingUrl + "/by-user",
  authMiddleware,
  bookingController.getBookingByUserID
);
router.put(
  baseBookingUrl + "/cancel/:bookingId",
  authMiddleware,
  bookingController.cancelBooking
);
router.post(
  baseBookingUrl + "/check-availability",
  bookingController.checkAvailability
);

export default router;
