import { verifyToken } from '../utils/jwt.js';
import UserModel from '../models/userModel.js';

/**
 * Middleware: Verify JWT and attach authenticated user to request
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required. Please sign in to proceed.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid token. Please sign in again.',
      });
    }

    // Verify user still exists in database and has active status
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.',
      });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        error: 'Your account has been deactivated by an administrator. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[authenticateUser] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failure.',
    });
  }
}

/**
 * Middleware: Enforce Administrator role
 */
export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrator privileges required to access this resource.',
    });
  }
  next();
}

export default {
  authenticateUser,
  authorizeAdmin,
};
