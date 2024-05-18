import Booking from "../models/booking.js";
import Room from "../models/room.js";
import Payment from "../models/payment.js";
import errorCodes from "../config/errorCodes.js";
import mongoose from "mongoose";

const amountRegex = /^\d+(\.\d{1,2})?$/;

const bookingController = {
  async bookRoom(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { bookings = [], totalAmount = 0.0, paymentMethod = "" } = req.body;
      const userId = req.user.userId;

      if (!bookings || bookings.length === 0.0) {
        return res.status(errorCodes.BAD_REQUEST).json({
          message:
            "Invalid request: No booking requests provided. Please specify at least one room type with desired quantity, check-in, and check-out dates.",
        });
      }

      if (totalAmount === 0 || !amountRegex.test(totalAmount)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid total amount format" });
      }

      if (!paymentMethod) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Payment method is required" });
      }

      const bookingResults = [];
      for (const booking of bookings) {
        const { roomId, checkInDate, checkOutDate } = booking;

        const conflicts = await Booking.find({
          room: roomId,
          $or: [
            {
              checkInDate: { $lt: new Date(checkOutDate) },
              checkOutDate: { $gt: new Date(checkInDate) },
            },
          ],
        }).session(session);

        if (conflicts.length > 0) {
          throw new Error(
            `Room ${roomId} is not available from ${checkInDate} to ${checkOutDate}.`
          );
        }

        const newBooking = new Booking({
          customer: userId,
          room: roomId,
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          totalAmount: totalAmount,
          status: "Confirmed",
        });
        await newBooking.save({ session });
        bookingResults.push(newBooking);

        const newPayment = new Payment({
          booking: newBooking._id,
          amount: totalAmount,
          paymentMethod: paymentMethod,
          transactionStatus: "Success",
        });
        await newPayment.save({ session });
      }

      await session.commitTransaction();
      res.status(200).json({
        message: "Booking successful",
        bookings: bookingResults,
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(errorCodes.BAD_REQUEST).json({ message: error.message });
    } finally {
      session.endSession();
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
  async checkAvailability(req, res, next) {
    try {
      const { requests = [] } = req.body;

      if (!requests || requests.length === 0) {
        return res.status(400).json({
          message:
            "Invalid request: No booking requests provided. Please specify at least one room type with desired quantity, check-in, and check-out dates.",
        });
      }

      const results = [];

      for (let request of requests) {
        const { type, quantity, checkInDate, checkOutDate } = request;
        const desiredCheckInDate = new Date(checkInDate);
        const desiredCheckOutDate = new Date(checkOutDate);

        const allRooms = await Room.find({ type });

        if (allRooms.length === 0) {
          results.push({
            type,
            quantityRequested: quantity,
            quantityAvailable: 0,
            available: false,
            message: `No rooms of type ${type} are available.`,
          });
          continue;
        }

        const roomIds = allRooms.map(
          (room) => new mongoose.Types.ObjectId(room._id)
        );

        const overlappingBookings = await Booking.aggregate([
          {
            $match: {
              room: { $in: roomIds },
              status: "Confirmed",
              $or: [
                {
                  checkInDate: { $lt: desiredCheckOutDate },
                  checkOutDate: { $gt: desiredCheckInDate },
                },
              ],
            },
          },
          {
            $group: {
              _id: "$room",
              count: { $sum: 1 },
            },
          },
        ]);

        const bookedRoomIds = overlappingBookings.map((booking) =>
          booking._id.toString()
        );

        const availableRooms = allRooms.filter(
          (room) => !bookedRoomIds.includes(room._id.toString())
        );

        const detailedAvailability = availableRooms
          .slice(0, quantity)
          .map((room) => {
            const nights =
              (desiredCheckOutDate - desiredCheckInDate) /
              (1000 * 60 * 60 * 24);
            const totalCost = room.price * nights;
            return {
              roomId: room._id,
              price: totalCost,
            };
          });

        if (detailedAvailability.length >= quantity) {
          results.push({
            type,
            quantityRequested: quantity,
            quantityAvailable: detailedAvailability.length,
            available: true,
            rooms: detailedAvailability,
          });
        } else {
          results.push({
            type,
            quantityRequested: quantity,
            quantityAvailable: detailedAvailability.length,
            available: false,
            message: `Only ${detailedAvailability.length} of ${quantity} requested ${type} rooms are available.`,
          });
        }
      }

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  },
};

export default bookingController;
