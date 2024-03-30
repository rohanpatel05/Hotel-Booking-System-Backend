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

// afterEach(async () => {
//   await User.deleteMany({});
// });

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
    const userData = {};

    const response = await request(app).post("/api/signup").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe(
      "Name, email, and password are required"
    );
  });

  // Test for invalid name format
  it("should return an error for invalid name format", async () => {
    const userData = {
      name: "123",
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
      email: "invalidemail",
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
      password: "weakpassword",
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

describe("POST /api/login Sign in Endpoint", () => {
  const validUser = {
    email: "johndoe@gmail.com",
    password: "StPassword123!",
  };

  // Test for missing required fields (email, password)
  it("should return an error for missing required fields", async () => {
    const userData = {};

    const response = await request(app).post("/api/login").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Email and password are required");
  });

  // Test for invalid email format
  it("should return an error for invalid email format", async () => {
    const userData = {
      email: "invalidemail",
      password: "TestPasd123!",
    };

    const response = await request(app).post("/api/login").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid email format");
  });

  // Test for invalid password format
  it("should return an error for invalid password format", async () => {
    const userData = {
      email: "test@example.com",
      password: "weakpassword",
    };

    const response = await request(app).post("/api/login").send(userData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid password format");
  });

  // Test for a user not registered with the provided email
  it("should return an error for user not registered", async () => {
    const userData = {
      email: "nonexistentuser@example.com",
      password: "Testord123!",
    };

    const response = await request(app).post("/api/login").send(userData);

    expect(response.status).toBe(errorCodes.UNAUTHORIZED);
    expect(response.body.message).toBe("User not registerd");
  });

  // Test for incorrect credentials (wrong password)
  it("should return an error for incorrect credentials", async () => {
    const userData = {
      email: "johndoe@gmail.com",
      password: "Incsword123!",
    };

    const response = await request(app).post("/api/login").send(userData);

    expect(response.status).toBe(errorCodes.UNAUTHORIZED);
    expect(response.body.message).toBe("Invalid credentials");
  });

  // Test for a successful login with valid credentials
  it("should login with valid credentials", async () => {
    const response = await request(app).post("/api/login").send(validUser);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.user).toBeTruthy();
  });
});

describe("GET /api/logout Logout Endpoint", () => {
  const accessToken = "";

  beforeAll(async () => {
    const userinfo = await request(app)
      .post("/api/login")
      .send({ email: "johndoe@gmail.com", password: "StPassword123!" });

    accessToken = userinfo.body.accessToken;
    console.log(userinfo.body.user);
    console.log(typeof userinfo.body.user._id);
  });

  // Test for a successful logout
  it("should logout successfully", async () => {
    const response = await request(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logout successful");
  });
});

describe("PUT /api/user/updateProfile/:userId Update User Profile Endpoint", () => {
  const userId = "";

  beforeAll(async () => {
    const userinfo = await request(app)
      .post("/api/login")
      .send({ email: "johndoe@gmail.com", password: "StPassword123!" });

    userId = userinfo.body.user._id.toString();
  });

  // Test for updating specific fields (name, email, phoneNumber, address)
  it("should update specific fields of user profile", async () => {
    const response = await request(app)
      .put(`/api/user/updateProfile/${userId}`)
      .send({
        name: "John Modified",
        email: "modifiedemail@gmail.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User profile updated successfully");
    expect(response.body.user.name).toBe("John Modified");
    expect(response.body.user.email).toBe("modifiedemail@gmail.com");
    expect(response.body.user.phoneNumber).toBeDefined();
    expect(response.body.user.address).toBeDefined();
  });

  // Test for a user not found with the provided user ID
  it("should return not found for user not found with provided user ID", async () => {
    const response = await request(app)
      .put("/api/user/updateProfile/invalidUserId")
      .send({
        name: "John Updated",
        email: "updatedemail@gmail.com",
        phoneNumber: "1234567890",
        address: "Updated Address",
      });

    expect(response.status).toBe(errorCodes.NOT_FOUND);
    expect(response.body.message).toBe("User not found");
  });

  // Test for a successful update of user profile with valid data
  it("should update user profile successfully with valid data", async () => {
    const response = await request(app)
      .put(`/api/user/updateProfile/${userId}`)
      .send({
        name: "John Updated",
        email: "updatedemail@gmail.com",
        phoneNumber: "1234567890",
        address: "Updated Address",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User profile updated successfully");
    expect(response.body.user.name).toBe("John Updated");
    expect(response.body.user.email).toBe("updatedemail@gmail.com");
    expect(response.body.user.phoneNumber).toBe("1234567890");
    expect(response.body.user.address).toBe("Updated Address");
  });
});

describe("PUT /api/user/changePassword/:userId Change Password Endpoint", () => {
  const userId = "";
  let authToken = "";

  beforeAll(async () => {
    const userinfo = await request(app)
      .post("/api/login")
      .send({ email: "updatedemail@gmail.com", password: "StPassword123!" });

    authToken = userinfo.body.accessToken;
    userId = userinfo.body.user._id.toString();
  });

  // Test for missing required fields (currentPassword, newPassword)
  it("should return bad request for missing currentPassword and newPassword", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe(
      "Current password, and new password are required"
    );
  });

  // Test for invalid current password format
  it("should return bad request for invalid current password format", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "weakpassword",
        newPassword: "Neord456!",
      });

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid current password format");
  });

  // Test for invalid new password format
  it("should return bad request for invalid new password format", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "Strod123!",
        newPassword: "weakpassword",
      });

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid new password format");
  });

  // Test for incorrect current password
  it("should return unauthorized for incorrect current password", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "IctPa@132",
        newPassword: "Newd456!",
      });

    expect(response.status).toBe(errorCodes.UNAUTHORIZED);
    expect(response.body.message).toBe("Incorrect current password");
  });

  // Test for new password being the same as the current password
  it("should return bad request for new password same as current password", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "StPassword123!",
        newPassword: "StPassword123!",
      });

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe(
      "New password cannot be the same as current password"
    );
  });

  // Test for a user not found with the provided user ID
  it("should return not found for user not found with provided user ID", async () => {
    const response = await request(app)
      .put("/api/user/changePassword/invalidUserId")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "Strord123!",
        newPassword: "NewSord456!",
      });

    expect(response.status).toBe(errorCodes.NOT_FOUND);
    expect(response.body.message).toBe("User not found");
  });

  // Test for a successful change of password with valid data
  it("should change password successfully with valid data", async () => {
    const response = await request(app)
      .put(`/api/user/changePassword/${userId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        currentPassword: "StPassword123!",
        newPassword: "StPassword1!!",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password changed successfully");
  });
});

describe("PUT /api/refresh Refresh Token Endpoint", () => {
  const refreshToken = "";

  beforeAll(async () => {
    const userinfo = await request(app)
      .post("/api/login")
      .send({ email: "updatedemail@gmail.com", password: "StPassword1!!" });

    refreshToken = userinfo.body.refreshToken;
  });

  // Test for a successful token refresh with a valid refresh token
  it("should refresh token successfully with valid refresh token", async () => {
    const response = await request(app)
      .post("/api/refresh")
      .send({ refreshToken: refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Access token refreshed successfully");
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.accessTokenExpiration).toBeDefined();
  });

  // Test for missing refresh token
  it("should return bad request for missing refresh token", async () => {
    const response = await request(app).post("/api/refresh").send({});

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Refresh token is required");
  });

  // Test for an invalid refresh token
  it("should return unauthorized for invalid refresh token", async () => {
    const response = await request(app)
      .post("/api/refresh")
      .send({ refreshToken: "invalid_refresh_token" });

    expect(response.status).toBe(errorCodes.UNAUTHORIZED);
    expect(response.body.message).toBe("Invalid refresh token");
  });

  // Test for a user not found with the decoded user ID from the refresh token
  it("should return unauthorized for user not found with decoded user ID", async () => {
    await User.deleteOne({ email: "updatedemail@gmail.com" });
    const response = await request(app)
      .post("/api/refresh")
      .send({ refreshToken: refreshToken });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("User not found");
  });
});
