import request from "supertest";
import app from "../app";
import User from "../models/user";

describe("User API Endpoints", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should sign up a new user", async () => {
    const newUser = {
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    };

    const response = await request(app)
      .post("/api/signup")
      .send(newUser)
      .set("Accept", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.name).toBe(newUser.name);
  });

  it("should sign in an existing user", async () => {
    const newUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    });
    await newUser.save();

    const response = await request(app)
      .post("/api/signin")
      .send({ email: "test@example.com", password: "Test@1234" })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("test@example.com");
  });

  it("should get user info", async () => {
    const newUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    });
    await newUser.save();

    const response = await request(app)
      .get("/api/user/user-info")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("test@example.com");
  });

  it("should update user profile", async () => {
    const newUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    });
    await newUser.save();

    const updatedProfile = {
      name: "Updated User",
      phoneNumber: "1234567890",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
      },
    };

    const response = await request(app)
      .put("/api/user/update-profile")
      .send(updatedProfile)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User profile updated successfully");
  });

  it("should change user password", async () => {
    const newUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "Test@1234",
    });
    await newUser.save();

    const passwordChange = {
      currentPassword: "Test@1234",
      newPassword: "NewPass@1234",
    };

    const response = await request(app)
      .put("/api/user/change-password")
      .send(passwordChange)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password changed successfully");
  });
});
