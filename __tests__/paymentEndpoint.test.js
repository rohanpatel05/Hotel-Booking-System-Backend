import request from "supertest";
import app from "../app.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import errorCodes from "../config/errorCodes.js";
import { connectDB, disconnectDB } from "../config/db.js";

const validPaymentData = {
  booking: "605b6266e43cf7298494924c",
  amount: 100.0,
  paymentMethod: "card",
  transactionStatus: "Pending",
  transactionId: "1234567890",
};

const validUserData = {
  name: "John Doi",
  email: "johndoe2@gmail.com",
  password: "StPhassword123!",
};

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await Payment.deleteMany({});
  await User.deleteMany({});
});

describe("POST /api/payment/intent Create Payment Intent Endpoint", () => {
  // Test for creating a payment intent with valid data
  it("should create a payment intent with valid data", async () => {
    const signupResponse = await request(app)
      .post("/api/signup")
      .send(validUserData);
    const accessToken = signupResponse.body.accessToken;

    const response = await request(app)
      .post("/api/payment/intent")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: validPaymentData.amount });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Payment intent successfully created");
    expect(response.body.paymentIntent).toBeTruthy();
  });

  // Test for creating a payment intent with missing amount
  it("should return bad request for missing amount", async () => {
    const signupResponse = await request(app)
      .post("/api/signup")
      .send(validUserData);
    const accessToken = signupResponse.body.accessToken;

    const response = await request(app)
      .post("/api/payment/intent")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Amount value is required");
  });

  // Test for creating a payment intent with invalid amount format
  it("should return bad request for invalid amount format", async () => {
    const signupResponse = await request(app)
      .post("/api/signup")
      .send(validUserData);
    const accessToken = signupResponse.body.accessToken;

    const response = await request(app)
      .post("/api/payment/intent")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: "invalid_amount" });

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid amount format");
  });
});

describe("GET /api/payment Get All Payments Endpoint", () => {
  beforeEach(async () => {
    const payment1 = new Payment(validPaymentData);
    const payment2 = new Payment({
      ...validPaymentData,
      amount: 200.0,
    });
    await payment1.save();
    await payment2.save();
  });

  // Test for getting all payments
  it("should return all payments", async () => {
    const response = await request(app).get("/api/payment/");

    expect(response.status).toBe(200);
    expect(response.body.payments.length).toBe(2);
    expect(response.body.payments[0].amount).toBe(100);
    expect(response.body.payments[1].amount).toBe(200);
  });
});

describe("GET /api/payment/:paymentId Get Payment by ID Endpoint", () => {
  let paymentId;

  beforeEach(async () => {
    const payment = new Payment(validPaymentData);
    await payment.save();
    paymentId = payment._id;
  });

  // Test for getting payment by ID
  it("should return payment by ID", async () => {
    const response = await request(app).get(`/api/payment/${paymentId}`);

    expect(response.status).toBe(200);
    expect(response.body.payment.amount).toBe(100);
    expect(response.body.payment.paymentMethod).toBe("card");
  });

  // Test for getting payment by non-existent ID
  it("should return not found for non-existent payment ID", async () => {
    const response = await request(app).get(
      "/api/payment/605b6266e43cf7298494924c"
    );

    expect(response.status).toBe(errorCodes.NOT_FOUND);
    expect(response.body.message).toBe("Payment not found");
  });
});
