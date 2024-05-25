import errorCodes from "../config/errorCodes.js";
import Payment from "../models/payment.js";
import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const priceRegex = /^\d+(\.\d{1,2})?$/;

const paymentController = {
  async processPayment(req, res, next) {
    try {
      const { amount = "" } = req.body;

      if (!amount) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Amount value is required" });
      }

      if (!priceRegex.test(amount)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid amount format" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.status(201).json({
        message: "Payment intent successfully created",
        paymentIntent: paymentIntent.client_secret,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllPayments(req, res, next) {
    try {
      const payments = await Payment.find({});
      return res.status(200).json({ payments: payments });
    } catch (error) {
      next(error);
    }
  },
  async getPaymentById(req, res, next) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Payment ID is required as req param" });
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Payment not found" });
      }

      return res.status(200).json({ payment: payment });
    } catch (error) {
      next(error);
    }
  },
  async stripeConfig(req, res, next) {
    try {
      res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    } catch (error) {
      next(error);
    }
  },
  async retrievePaymentMethod(req, res, next) {
    const { paymentMethodId = "" } = req.body;

    if (!paymentMethodId) {
      return res
        .status(errorCodes.BAD_REQUEST)
        .json({ message: "Payment method ID is required" });
    }

    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      res.status(200).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default paymentController;
