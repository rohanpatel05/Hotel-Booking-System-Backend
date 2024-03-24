import express from 'express';
import userController from '../controllers/userControllers.js';

const router = express.Router();

let baseUserUrl = '/user'

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.put('/refresh', userController.refresh);

// User profile routes
router.put(baseUserUrl + '/updateProfile/:userId', userController.updateUserProfile);
router.put(baseUserUrl + '/changePassword/:userId', userController.changePassword);

export default router;
