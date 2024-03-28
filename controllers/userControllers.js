import errorCodes from '../config/errorCodes.js'
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const nameRegex = /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/; 
const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/; 
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

const accessTokenExpiresIn = '15m';
const refreshTokenExpiresIn = '7d';
const accessTokenExpiration = 900;
const refreshTokenExpiration = 604800;

const userController = {
    async signup (req, res, next) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password ) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Name, email, and password are required" });
            }
            if (!nameRegex.test(name)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid name format" });
            }
            if (!emailRegex.test(email)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid email format" });
            }
            if (!passwordRegex.test(password)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid password format" });
            }

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: 'User already exists with this email' });
            }

            const newUser = new User({
                name,
                email,
                password
            });
            await newUser.save();

            const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiresIn });
            const refreshToken = jwt.sign({ userId: newUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiresIn });

            console.log(accessToken);
            console.log(refreshToken);
            console.log(newUser);

            res.status(201).json({
                message: 'User created successfully',
                accessToken,
                accessTokenExpiration: accessTokenExpiration, 
                refreshToken,
                refreshTokenExpiration: refreshTokenExpiration, 
                user: newUser
            });

        } catch (error) {
            next(error); 
        }
    },
    async login (req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: 'Email and password are required' });
            }
            if (!emailRegex.test(email)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid email format" });
            }
            if (!passwordRegex.test(password)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid password format" });
            }

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(errorCodes.UNAUTHORIZED).json({ message: 'User not registerd' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(errorCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
            }

            const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiresIn });
            const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiresIn });

            res.status(200).json({
                message: 'Login successful',
                accessToken,
                accessTokenExpiration: accessTokenExpiration, 
                refreshToken,
                refreshTokenExpiration: refreshTokenExpiration, 
                user
            });
        } catch (error) {
            next(error);
        }
    },
    async logout (req, res, next) {
        try {
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            next(error); 
        }
    },
    async refresh (req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: 'Refresh token is required' });
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(errorCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
                }

                const user = await User.findById(decoded.userId);

                if (!user) {
                    return res.status(errorCodes.UNAUTHORIZED).json({ message: 'User not found' });
                }

                const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiresIn });

                res.status(200).json({
                    message: 'Access token refreshed successfully',
                    accessToken,
                    accessTokenExpiration: accessTokenExpiration
                });
            });
        } catch (error) {
            next(error);
        }
    },
    async updateUserProfile (req, res, next) {
        try {
            const { userId } = req.params;
            const { name, email, phoneNumber, address } = req.body;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(errorCodes.NOT_FOUND).json({ message: 'User not found' });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (address) user.address = address;

            await user.save();

            res.status(200).json({ message: 'User profile updated successfully', user });
        } catch (error) {
            next(error); 
        }
    },
    async changePassword (req, res, next) {
        try {
            const { userId } = req.params;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword ) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Current password, and new password are required" });
            }
            if (!passwordRegex.test(currentPassword)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid current password format" });
            }
            if (!passwordRegex.test(newPassword)) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "Invalid new password format" });
            }

            if (currentPassword === newPassword) {
                return res.status(errorCodes.BAD_REQUEST).json({ message: "New password cannot be the same as current password" });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(errorCodes.NOT_FOUND).json({ message: 'User not found' });
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);

            if (!passwordMatch) {
                return res.status(errorCodes.UNAUTHORIZED).json({ message: 'Incorrect current password' });
            }

            user.password = newPassword;
            await user.save();

            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            next(error); 
        }
    }
}

export default userController;