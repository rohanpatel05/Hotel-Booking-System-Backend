
# Hotel Booking System - Backend

This repository contains the backend code for the Hotel Booking System, providing a robust and scalable API server for handling hotel room bookings. The backend is built with Express.js and MongoDB, incorporating various features to ensure security, performance, and reliability.

## Features

- **Authentication and Authorization**: Utilizes JWT tokens and cookies for secure user authentication and authorization.
- **Database**: MongoDB for a scalable and flexible database solution.
- **API Design**: Well-structured API routes, controllers, and middleware to handle all application logic.
- **Payment Integration**: Integrated with Stripe for secure and reliable payment processing.
- **Validation**: Implements robust input validation and error handling using regular expressions and custom validation logic.
- **Security**: Implements CORS policy to ensure secure cross-origin requests.
- **Protected Routes**: Ensures that certain API endpoints are accessible only to authenticated users.
- **Password Encryption**: Secure user password storage with encryption.
- **Testing**: Comprehensive testing suite using Jest to ensure code quality and reliability.
- **CI/CD Pipeline**: Automated build, test, and deployment pipeline using Jenkins and Docker, with Docker images pushed to a Docker repository.
- **Deployment**: Deployed on Render.com for a seamless deployment experience.
- **Folder Structure**: Organized and scalable folder structure for maintainability and scalability.

## Technologies and Tools

- Express.js
- MongoDB
- JWT Tokens
- Cookies
- API Routes, Controllers, Middleware
- Regular Expressions
- Error Handler
- Protected Routes
- Password Encryption
- CORS Policy
- Stripe Payment Gateway
- Docker
- Jenkins CI/CD Pipeline
- Jest Testing
- Render (Deployment)

## Links

- [Deployed App](https://hotel-booking-system-tczx.onrender.com/)
- [Frontend Repository](https://github.com/rohanpatel05/Hotel-Booking-System-Frontend/)
- [Docker Repository (Server)](https://hub.docker.com/repository/docker/rohankp/hotel-booking-system-backend/general)

**Note:** the server will spin down with inactivity, which can delay requests by 50 seconds or more. So, if this is encountered, please try again. 
