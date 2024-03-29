import request from "supertest";
import app from "../app.js";
import User from "../models/user.js";
import errorCodes from "../config/errorCodes.js";
import { connectDB, disconnectDB } from "../config/db.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /api/signup Signup Endpoint", () => {
  // Test for a successful signup with valid user data
  it("should create a new user with valid data", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "StPassword123!",
    };

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
    expect(response.body.user).toBeTruthy();
  });

  // Test for missing required fields (name, email, password)
  it("should return an error for missing required fields", async () => {
    const userData = {}; // Empty object to simulate missing fields

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe(
      "Name, email, and password are required"
    );
  });

  // Test for invalid name format
  it("should return an error for invalid name format", async () => {
    const userData = {
      name: "123", // Invalid name format
      email: "test@gmail.com",
      password: "TestPassword123!",
    };

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid name format");
  });

  // Test for invalid email format
  it("should return an error for invalid email format", async () => {
    const userData = {
      name: "Test User",
      email: "invalidemail", // Invalid email format
      password: "TestPassword123!",
    };

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid email format");
  });

  // Test for invalid password format
  it("should return an error for invalid password format", async () => {
    const userData = {
      name: "Test User",
      email: "test@gmail.com",
      password: "weakpassword", // Invalid password format
    };

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid password format");
  });

  // Test for a user already existing with the same email
  it("should return an error for existing user with same email", async () => {
    const existingUser = await User.findOne({ email: "johndoe@gmail.com" });

    const userData = {
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "StPassword123!",
    };

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("User already exists with this email");
  });
});
