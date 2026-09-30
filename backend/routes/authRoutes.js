import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Base route for /api/auth
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is running',
    endpoints: ['POST /register', 'POST /signup', 'POST /login', 'POST /logout', 'GET /me']
  });
});

// Public auth routes
router.post('/register', signup);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected user route
router.get('/me', authenticateUser, getMe);

export default router;
