import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Base route for /api/admin
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API is running',
    endpoints: ['GET /stats', 'GET /users', 'GET /users/:id', 'PUT /users/:id', 'PATCH /users/:id/status', 'PATCH /users/:id/role', 'DELETE /users/:id']
  });
});

// Apply authentication and admin authorization to ALL admin endpoints
router.use(authenticateUser);
router.use(authorizeAdmin);

// Dashboard overview statistics
router.get('/stats', getDashboardStats);

// User management endpoints
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
