import Booking from "../models/booking.js";
import Room from "../models/room.js";
import Payment from "../models/payment.js";
import errorCodes from "../config/errorCodes.js";

const amountRegex = /^\d+(\.\d{1,2})?$/;

const bookingController = {
  async bookRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const {
        checkInDate = null,
        checkOutDate = null,
        totalAmount = "",
        status = "",
        paymentMethod = "",
      } = req.body;

      if (
        !checkInDate ||
        !checkOutDate ||
        new Date(checkInDate) >= new Date(checkOutDate)
      ) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid check-in or check-out date" });
      }

      if (!totalAmount || !amountRegex.test(totalAmount)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid total amount format" });
      }

      // Check if room exists
      const room = await Room.findById(roomId);
      if (!room) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Room not found" });
      }

      // Check room availability
      if (!room.availability) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Room is not available" });
      }

      // Create booking
      const booking = new Booking({
        customer: req.user.userId,
        room: roomId,
        checkInDate,
        checkOutDate,
        totalAmount,
        status: status || "Pending",
      });
      await booking.save();

      // Create payment record
      const payment = new Payment({
        booking: booking._id,
        amount: totalAmount,
        paymentMethod,
      });
      await payment.save();

      // Update room availability
      room.availability = false;
      await room.save();

      return res.status(201).json({
        message: "Booking created successfully",
        booking: booking,
        payment: payment,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllBookings(req, res, next) {
    try {
      const bookings = await Booking.find({ customer: req.user.userId });
      return res.status(200).json({ booking: bookings });
    } catch (error) {
      next(error);
    }
  },
  async getBookingById(req, res, next) {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findOne({
        _id: bookingId,
        customer: req.user.userId,
      });

      if (!booking) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Booking not found" });
      }

      return res.status(200).json({ booking: booking });
    } catch (error) {
      next(error);
    }
  },
  async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findOne({
        _id: bookingId,
        customer: req.user.userId,
      });

      if (!booking) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Booking not found" });
      }

      booking.status = "Cancelled";
      await booking.save();

      // Update room availability
      const room = await Room.findById(booking.room);
      if (room) {
        room.availability = true;
        await room.save();
      }

      return res
        .status(200)
        .json({ message: "Booking cancelled successfully", booking: booking });
    } catch (error) {
      next(error);
    }
  },
};

export default bookingController;
