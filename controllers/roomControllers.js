import Room from "../models/room.js";
import errorCodes from "../config/errorCodes.js";

const roomNumberRegex = /^\d+$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;
const bedsRegex = /^\d+$/;

const roomController = {
  async getAllRooms(req, res, next) {
    try {
      const rooms = await Room.find({});
      return res.status(200).json({ rooms: rooms });
    } catch (error) {
      next(error);
    }
  },
  async getRoomById(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Room ID is required as req param" });
      }

      const room = await Room.findById(userId);
      if (!room) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Room not found" });
      }

      return res.status(200).json({ room: room });
    } catch (error) {
      next(error);
    }
  },
  async createRoom(req, res, next) {
    try {
      const {
        roomNumber = "",
        type = "",
        price = "",
        amenities = [],
        beds = "",
        availability = true,
      } = req.body;

      if (!roomNumber || !type || !price || !beds) {
        return res.status(errorCodes.BAD_REQUEST).json({
          message:
            "Room number, room type, price, and beds values are required",
        });
      }

      if (!roomNumberRegex.test(roomNumber)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid room number format" });
      }

      if (!["Standard", "Deluxe", "Suite"].includes(type)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid room type" });
      }

      if (!priceRegex.test(price)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid price format" });
      }

      if (!bedsRegex.test(beds)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid number of beds" });
      }

      const room = new Room({
        roomNumber,
        type,
        price,
        amenities,
        beds,
        availability,
      });

      const createdRoom = await room.save();
      return res
        .status(201)
        .json({ message: "Room created successfully", room: createdRoom });
    } catch (error) {
      next(error);
    }
  },
  async updateRoom(req, res, next) {
    try {
      const { userId } = req.params;
      const {
        roomNumber = "",
        type = "",
        price = "",
        amenities = [],
        beds = "",
        availability = undefined,
      } = req.body;

      if (!userId) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Room ID is required as req param" });
      }

      if (roomNumber && !roomNumberRegex.test(roomNumber)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid room number format" });
      }

      if (price && !priceRegex.test(price)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid price format" });
      }

      if (beds && !bedsRegex.test(beds)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid beds format" });
      }

      let room = await Room.findById(userId);

      if (!room) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Room not found" });
      }

      if (roomNumber) room.roomNumber = roomNumber;
      if (type) room.type = type;
      if (price) room.price = price;
      if (amenities.length > 0) room.amenities = amenities;
      if (beds) room.beds = beds;
      if (availability !== undefined) room.availability = availability;

      await room.save();

      return res
        .status(200)
        .json({ message: "Room updated successfully", room: room });
    } catch (error) {
      next(error);
    }
  },
  async deleteRoom(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Room ID is required as req param" });
      }

      const room = await Room.findByIdAndDelete(userId);

      if (!room) {
        return res
          .status(errorCodes.NOT_FOUND)
          .json({ message: "Room not found" });
      }

      return res
        .status(200)
        .json({ message: "Room deleted successfully", room });
    } catch (error) {
      next(error);
    }
  },
};

export default roomController;
