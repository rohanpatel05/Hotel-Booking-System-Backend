import request from "supertest";
import app from "../app.js";
import Room from "../models/room.js";
import errorCodes from "../config/errorCodes.js";
import { connectDB, disconnectDB } from "../config/db.js";

const validRoomData = {
  roomNumber: "101",
  type: "Standard",
  price: "100.00",
  amenities: ["Wi-Fi", "TV"],
  beds: "1",
  availability: true,
};

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await Room.deleteMany({});
});

describe("GET /api/room/ Get All Rooms Endpoint", () => {
  beforeEach(async () => {
    const room1 = new Room(validRoomData);
    const room2 = new Room({
      ...validRoomData,
      roomNumber: "102",
      type: "Deluxe",
    });
    await room1.save();
    await room2.save();
  });

  // Test for getting all rooms
  it("should return all rooms", async () => {
    const response = await request(app).get("/api/room/");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].roomNumber).toBe(101);
    expect(response.body[1].roomNumber).toBe(102);
  });
});

describe("GET /api/room/byId/:userId Get Room by ID Endpoint", () => {
  let roomId;

  beforeEach(async () => {
    const room = new Room(validRoomData);
    await room.save();
    roomId = room._id;
  });

  // Test for getting room by ID
  it("should return room by ID", async () => {
    const response = await request(app).get(`/api/room/byId/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.room.roomNumber).toBe(101);
    expect(response.body.room.type).toBe("Standard");
    expect(response.body.room.price).toBe(100);
  });

  // Test for getting room by non-existent ID
  it("should return not found for non-existent room ID", async () => {
    const response = await request(app).get(
      "/api/room/byId/605b6266e43cf7298494924c"
    );

    expect(response.status).toBe(errorCodes.NOT_FOUND);
    expect(response.body.message).toBe("Room not found");
  });
});

describe("POST /api/room/create Create Room Endpoint", () => {
  // Test for a successful room creation with valid data
  it("should create a new room with valid data", async () => {
    const response = await request(app)
      .post("/api/room/create")
      .send(validRoomData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Room created successfully");
    expect(response.body.room).toBeTruthy();
  });

  // Test for missing required fields (roomNumber, type, price, beds)
  it("should return an error for missing required fields", async () => {
    const roomData = {};

    const response = await request(app).post("/api/room/create").send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe(
      "Room number, room type, price, and beds values are required"
    );
  });

  // Test for invalid room number format
  it("should return an error for invalid room number format", async () => {
    const roomData = {
      ...validRoomData,
      roomNumber: "101A",
    };

    const response = await request(app).post("/api/room/create").send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid room number format");
  });

  // Test for invalid room type
  it("should return an error for invalid room type", async () => {
    const roomData = {
      ...validRoomData,
      type: "Executive",
    };

    const response = await request(app).post("/api/room/create").send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid room type");
  });

  // Test for invalid price format
  it("should return an error for invalid price format", async () => {
    const roomData = {
      ...validRoomData,
      price: "100.005",
    };

    const response = await request(app).post("/api/room/create").send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid price format");
  });

  // Test for invalid number of beds format
  it("should return an error for invalid number of beds", async () => {
    const roomData = {
      ...validRoomData,
      beds: "1A",
    };

    const response = await request(app).post("/api/room/create").send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid number of beds");
  });
});

describe("PUT /api/room/update/:userId Update Room Endpoint", () => {
  let roomId;

  beforeEach(async () => {
    const room = new Room(validRoomData);
    await room.save();
    roomId = room._id;
  });

  // Test for a successful update of room with valid data
  it("should update room successfully with valid data", async () => {
    const updatedRoomData = {
      ...validRoomData,
      price: "120.00",
    };

    const response = await request(app)
      .put(`/api/room/update/${roomId}`)
      .send(updatedRoomData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room updated successfully");
    expect(response.body.room).toBeTruthy();
    expect(response.body.room.price).toBe(120);
  });

  // Test for invalid room number format
  it("should return an error for invalid room number format", async () => {
    const roomData = {
      ...validRoomData,
      roomNumber: "101A",
    };

    const response = await request(app)
      .put(`/api/room/update/${roomId}`)
      .send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid room number format");
  });

  // Test for invalid price format
  it("should return an error for invalid price format", async () => {
    const roomData = {
      ...validRoomData,
      price: "100.005",
    };

    const response = await request(app)
      .put(`/api/room/update/${roomId}`)
      .send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid price format");
  });

  // Test for invalid number of beds format
  it("should return an error for invalid number of beds", async () => {
    const roomData = {
      ...validRoomData,
      beds: "1A",
    };

    const response = await request(app)
      .put(`/api/room/update/${roomId}`)
      .send(roomData);

    expect(response.status).toBe(errorCodes.BAD_REQUEST);
    expect(response.body.message).toBe("Invalid beds format");
  });
});

describe("DELETE /api/room/delete/:userId Delete Room Endpoint", () => {
  let roomId;

  beforeEach(async () => {
    const room = new Room(validRoomData);
    await room.save();
    roomId = room._id;
  });

  // Test for a successful deletion of room
  it("should delete room successfully", async () => {
    const response = await request(app).delete(`/api/room/delete/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room deleted successfully");
    expect(response.body.room).toBeTruthy();
  });
});
