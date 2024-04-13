import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roomSchema = new Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["Standard", "Deluxe", "Suite"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amenities: [String],
  beds: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
});

const Room = model("Room", roomSchema);

export default Room;
