/**
 * Rate Limiting Middleware
 * Protects against brute-force attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * Limiter for login attempts
 * Maximum 5 attempts per 15-minute window
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 5, // Maximum 5 attempts
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    // Key customization (default: IP)
    keyGenerator: (req) => {
        return req.ip;
    }
});

/**
 * General API limiter
 * Maximum 100 requests per minute
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1-minute window
    max: 100, // Maximum 100 requests
    message: {
        error: 'Too many requests. Please wait.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter
};
