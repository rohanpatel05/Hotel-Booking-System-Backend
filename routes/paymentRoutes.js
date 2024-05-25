import express from "express";
import paymentController from "../controllers/paymentControllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddlewear.js";

const router = express.Router();

const basePaymentURL = "/payment";

router.post(
  basePaymentURL + "/intent",
  userAuthMiddleware,
  paymentController.processPayment
);
router.get(basePaymentURL, paymentController.getAllPayments);
router.get(basePaymentURL + "/config", paymentController.stripeConfig);
router.post(
  basePaymentURL + "/retrieve-payment-method",
  paymentController.retrievePaymentMethod
);
router.get(
  basePaymentURL + "/get/:paymentId",
  paymentController.getPaymentById
);

export default router;
