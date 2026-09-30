import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'emergency_care_jwt_super_secret_key_2026_hackathon_98234';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT token
 * @param {object} payload - Data to embed in token (id, email, role, etc.)
 * @returns {string} - JWT string
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - Bearer token
 * @returns {object} - Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export default {
  generateToken,
  verifyToken,
};
