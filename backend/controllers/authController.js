import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import UserModel from '../models/userModel.js';

/**
 * Controller: Register a new user
 * POST /api/auth/signup
 */
export async function signup(req, res) {
  try {
    const { full_name, email, mobile, password, confirmPassword } = req.body;

    // Field presence validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required fields.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match. Please verify both entries.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    // Check if user already exists
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Hash password with bcrypt
    const password_hash = await hashPassword(password);

    // Create user in database (default role 'user', default status 'active')
    const newUser = await UserModel.create({
      full_name,
      email,
      mobile: mobile || null,
      password_hash,
      role: 'user',
      status: 'active',
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('[authController.signup] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Registration failed due to a server error. Please try again.',
    });
  }
}

/**
 * Controller: User and Admin Login
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    // Look up user including password hash
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Check if account is deactivated
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        error: 'Your account has been deactivated. Please contact the administrator for assistance.',
      });
    }

    // Verify bcrypt password hash
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return safe user object (no password hash)
    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
    };

    return res.status(200).json({
      success: true,
      message: 'Sign in successful!',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[authController.login] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Sign in failed due to a server error. Please try again.',
    });
  }
}

/**
 * Controller: Get current authenticated user profile
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error('[authController.getMe] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile.',
    });
  }
}

/**
 * Controller: Logout
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export default {
  signup,
  login,
  getMe,
  logout,
};
