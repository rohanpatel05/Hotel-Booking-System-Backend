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
router.get(basePaymentURL + "/:paymentId", paymentController.getPaymentById);

export default router;
