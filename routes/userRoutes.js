import express from 'express';
import userController from '../controllers/userControllers.js';

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.post('/refresh', userController.refresh);

// User profile routes
router.put('/update-profile', userController.updateUserProfile);
router.put('/change-password', userController.changePassword);

export default router;
