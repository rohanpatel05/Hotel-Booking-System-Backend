import express from "express";
import paymentController from "../controllers/paymentControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";
import mockAuthMiddleware from "../middlewares/mockAuthMiddleware.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

const basePaymentURL = "/payment";

const authMiddleware =
  process.env.NODE_ENV === "test" ? mockAuthMiddleware : userAuthMiddleware;

router.post(
  basePaymentURL + "/intent",
  authMiddleware,
  paymentController.processPayment
);
router.get(
  basePaymentURL,
  authMiddleware,
  adminAuthMiddleware,
  paymentController.getAllPayments
);
router.get(basePaymentURL + "/config", paymentController.stripeConfig);
router.post(
  basePaymentURL + "/retrieve-payment-method",
  paymentController.retrievePaymentMethod
);
router.get(
  basePaymentURL + "/get/:paymentId",
  authMiddleware,
  adminAuthMiddleware,
  paymentController.getPaymentById
);

export default router;
