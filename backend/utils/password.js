import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password string is required for hashing');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a bcrypt hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Stored bcrypt hash
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
export async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(password, hashedPassword);
}

export default {
  hashPassword,
  comparePassword,
};
