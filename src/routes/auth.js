/**
 * Authentication Routes
 * Defines endpoints for registration, login and user management
 *
 * SECURITY: The JWT token is transmitted via HTTP-only cookie (not in the JSON body)
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

// ============================================
// PUBLIC ROUTES (no token required)
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 * The token is returned in an HTTP-only cookie
 */
router.post('/register',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .isEmail().withMessage('Invalid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    authController.register
);

/**
 * POST /api/auth/login
 * Log in a user
 * The token is returned in an HTTP-only cookie
 * Rate limiting applied to prevent brute force
 */
router.post('/login',
    loginLimiter,
    [
        body('email')
            .isEmail().withMessage('Invalid email')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
    ],
    authController.login
);

/**
 * POST /api/auth/logout
 * Logout - deletes the cookie containing the token
 */
router.post('/logout', authController.logout);

// ============================================
// PROTECTED ROUTES (JWT token required in cookie)
// ============================================

/**
 * GET /api/auth/me
 * Get the logged-in user's information
 * Used to check if the session is active
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update the logged-in user's profile
 */
router.put('/profile',
    authMiddleware,
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required'),
        body('email')
            .isEmail().withMessage('Invalid email')
            .normalizeEmail()
    ],
    authController.updateProfile
);

/**
 * PUT /api/auth/password
 * Change the logged-in user's password
 */
router.put('/password',
    authMiddleware,
    [
        body('currentPassword')
            .notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    ],
    authController.changePassword
);

// ============================================
// ADMIN ROUTES (JWT token + admin role required)
// ============================================

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get('/users',
    authMiddleware,
    authController.getAllUsers
);

/**
 * PUT /api/auth/users/:id/role
 * Update a user's role (admin only)
 */
router.put('/users/:id/role',
    authMiddleware,
    [
        body('role')
            .isIn(['user', 'admin']).withMessage('Invalid role')
    ],
    authController.updateUserRole
);

/**
 * DELETE /api/auth/users/:id
 * Delete a user (admin only)
 */
router.delete('/users/:id',
    authMiddleware,
    authController.deleteUser
);

module.exports = router;
