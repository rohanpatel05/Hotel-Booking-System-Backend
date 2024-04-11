import errorCodes from "../config/errorCodes.js";
import Payment from "../models/payment.js";
import Stripe from "stripe";
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
        amount: amount,
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
};

export default paymentController;
