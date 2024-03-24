import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const paymentSchema = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    transactionId: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Payment = model('Payment', paymentSchema);

export default Payment;
