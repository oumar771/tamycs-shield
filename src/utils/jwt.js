/**
 * JWT Utilities
 * Handles JWT token generation and verification
 */

const jwt = require('jsonwebtoken');

// Default secret key (must be set in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production';

/**
 * Generates a JWT access token
 * @param {string} userId - User ID
 * @returns {string} Signed JWT token
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '24h' } // Token valid for 24 hours
    );
};

/**
 * Verifies and decodes a JWT token
 * @param {string} token - Token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    verifyToken
};
