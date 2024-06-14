import request from "supertest";
import app from "../app";
import Room from "../models/room";

describe("Room API Endpoints", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    await Room.deleteMany({});
  });

  it("should create a new room", async () => {
    const newRoom = {
      roomNumber: 101,
      type: "Deluxe",
      description: "A deluxe room",
      price: 200,
      amenities: ["WiFi", "TV"],
      beds: 2,
    };

    const response = await request(app)
      .post("/api/room/create")
      .send(newRoom)
      .set("Accept", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("room");
    expect(response.body.room.roomNumber).toBe(newRoom.roomNumber);
  });

  it("should get all rooms", async () => {
    const room = new Room({
      roomNumber: 101,
      type: "Deluxe",
      description: "A deluxe room",
      price: 200,
      amenities: ["WiFi", "TV"],
      beds: 2,
    });
    await room.save();

    const response = await request(app).get("/api/room/");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].roomNumber).toBe(room.roomNumber);
  });

  it("should get a room by ID", async () => {
    const room = new Room({
      roomNumber: 102,
      type: "Suite",
      description: "A suite room",
      price: 300,
      amenities: ["WiFi", "TV", "Mini Bar"],
      beds: 3,
    });
    await room.save();

    const response = await request(app).get(`/api/room/by-id/${room._id}`);

    expect(response.status).toBe(200);
    expect(response.body.room).toHaveProperty("_id", room._id.toString());
  });

  it("should update a room", async () => {
    const room = new Room({
      roomNumber: 103,
      type: "Classic",
      description: "A classic room",
      price: 100,
      amenities: ["WiFi"],
      beds: 1,
    });
    await room.save();

    const updatedRoom = {
      roomNumber: 103,
      type: "Classic",
      description: "An updated classic room",
      price: 150,
      amenities: ["WiFi", "TV"],
      beds: 1,
    };

    const response = await request(app)
      .put(`/api/room/update/${room._id}`)
      .send(updatedRoom)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.room.description).toBe(updatedRoom.description);
    expect(response.body.room.price).toBe(updatedRoom.price);
  });

  it("should delete a room", async () => {
    const room = new Room({
      roomNumber: 104,
      type: "Suite",
      description: "A suite room",
      price: 400,
      amenities: ["WiFi", "TV", "Mini Bar"],
      beds: 3,
    });
    await room.save();

    const response = await request(app).delete(`/api/room/delete/${room._id}`);

    expect(response.status).toBe(200);
    expect(response.body.room).toHaveProperty("_id", room._id.toString());

    const getResponse = await request(app).get(`/api/room/by-id/${room._id}`);
    expect(getResponse.status).toBe(404);
  });
});
