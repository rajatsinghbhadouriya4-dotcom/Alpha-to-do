import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', signup);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected user route
router.get('/me', authenticateUser, getMe);

export default router;
