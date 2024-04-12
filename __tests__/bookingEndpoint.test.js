import request from "supertest";
import app from "../app";
import Booking from "../models/booking";
import Room from "../models/room";
import Payment from "../models/payment";
import { connectDB, disconnectDB } from "../config/db";
import User from "../models/user";

const validRoomData = {
  roomNumber: 101,
  type: "Standard",
  price: 100,
  amenities: ["Wi-Fi", "TV"],
  beds: 1,
  availability: true,
};

const validBookingData = {
  checkInDate: new Date(),
  checkOutDate: new Date(),
  totalAmount: 500,
  status: "Pending",
  paymentMethod: "Credit Card",
};

const validCustomerData = {
  name: "Johny Doe",
  email: "johndoe3@gmail.com",
  password: "StPtssword123!",
};

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await Booking.deleteMany({});
  await Room.deleteMany({});
  await Payment.deleteMany({});
  await User.deleteMany({});
});

describe("POST /api/booking/book/:roomId Create Booking Endpoint", () => {
  it("should create a booking, payment record, and update room availability", async () => {
    const room = new Room(validRoomData);
    await room.save();
    const roomId = room._id;

    const signupResponse = await request(app)
      .post("/api/signup")
      .send(validCustomerData);
    const accessToken = signupResponse.body.accessToken;

    const response = await request(app)
      .post(`/api/booking/book/${roomId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(validBookingData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Booking created successfully");
    expect(response.body.booking).toBeDefined();
    expect(response.body.payment).toBeDefined();

    const booking = await Booking.findById(response.body.booking._id);
    expect(booking).toBeTruthy();

    const payment = await Payment.findOne({ booking: booking._id });
    expect(payment).toBeTruthy();

    const updatedRoom = await Room.findById(roomId);
    expect(updatedRoom.availability).toBe(false);
  });
});

describe("GET /api/booking/:bookingId Get Booking by ID Endpoint", () => {
  it("should return booking by ID", async () => {
    const booking = new Booking(validBookingData);
    await booking.save();

    const response = await request(app).get(`/api/booking/${booking._id}`);

    expect(response.status).toBe(200);
    expect(response.body.booking).toBeDefined();
    expect(response.body.booking._id).toBe(booking._id.toString());
  });
});

describe("GET /api/booking/ Get All Bookings Endpoint", () => {
  it("should return all bookings", async () => {
    const booking1 = new Booking(validBookingData);
    const booking2 = new Booking({
      ...validBookingData,
      checkInDate: new Date("2024-04-10"),
      checkOutDate: new Date("2024-04-15"),
    });
    await booking1.save();
    await booking2.save();

    const response = await request(app).get("/api/booking/");

    expect(response.status).toBe(200);
    expect(response.body.booking.length).toBe(2);
    expect(response.body.booking[0]._id).toBe(booking1._id.toString());
    expect(response.body.booking[1]._id).toBe(booking2._id.toString());
  });
});

describe("PUT /api/booking/cancel/:bookingId Cancel Booking Endpoint", () => {
  it("should cancel booking and update room availability", async () => {
    const booking = new Booking(validBookingData);
    await booking.save();
    const roomId = booking.room;

    const signupResponse = await request(app)
      .post("/api/signup")
      .send(validCustomerData);
    const accessToken = signupResponse.body.accessToken;

    const response = await request(app)
      .put(`/api/booking/cancel/${booking._id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Booking cancelled successfully");

    const cancelledBooking = await Booking.findById(booking._id);
    expect(cancelledBooking.status).toBe("Cancelled");

    const updatedRoom = await Room.findById(roomId);
    expect(updatedRoom.availability).toBe(true);
  });
});
