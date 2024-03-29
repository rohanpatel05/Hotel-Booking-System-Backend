import request from 'supertest';
import 'dotenv/config';
import app from '../index.js'; 
import { connectDB, disconnectDB } from '../config/db.js';
import errorCodes from "../config/errorCodes.js";
import errorHandlerMiddleware from '../middlewares/errorHandler.js';

let server; 

beforeAll(async() => {
    const port = process.env.PORT || 8080;
    server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    await connectDB();

});

afterAll(async() => {
    await server.close();
    console.log('Server closed successfully');
    await disconnectDB();
});

test('GET /test should return status 200 and a success message for /test route', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe("It's working!");
});

test('POST /test should parse JSON requests using express.json middleware', async () => {
    const response = await request(app)
        .post('/test')
        .send({ message: 'Hello, world!' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Hello, world!');
});