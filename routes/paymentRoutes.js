import express from 'express';
import paymentController from '../controllers/paymentControllers.js';

const router = express.Router();

let basePaymentURL = '/payment';

router.post(basePaymentURL + '/:bookingId/pay', paymentController.processPayment);
router.get(basePaymentURL + '/:id', paymentController.getPaymentById);

export default router;
