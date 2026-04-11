/**
 * Authentication Middleware
 * Verifies the JWT token from the HTTP-only cookie and adds the user ID to the request
 *
 * SECURITY: The token is read from an HTTP-only cookie, not from the Authorization header.
 * This protects against XSS attacks since JavaScript cannot access the cookie.
 */

const { verifyToken } = require('../utils/jwt');

/**
 * Middleware that checks for the presence and validity of the JWT token in the cookie
 * Adds req.userId if the token is valid
 */
const authMiddleware = (req, res, next) => {
    // Get the token from the cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            error: 'Access denied. Please log in.'
        });
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            error: 'Session expired. Please log in again.'
        });
    }

    // Add the user ID to the request for subsequent routes
    req.userId = decoded.userId;
    next();
};

module.exports = authMiddleware;
