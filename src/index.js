/**
 * User Account Management Application
 * Express server with MongoDB
 *
 * Secure Programming Project - ESAIP
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARES
// ============================================

// Helmet adds security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"]
        }
    },
    // Clickjacking protection
    frameguard: { action: 'deny' },
    // Force HTTPS
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    },
    // Disable MIME sniffing
    noSniff: true,
    // XSS protection
    xssFilter: true
}));

// CORS configuration with credentials for cookies
app.use(cors({
    origin: process.env.CORS_ORIGIN || true, // true allows all origins in dev
    credentials: true // Allow cookies to be sent
}));

// Cookie parser (required to read the JWT token)
app.use(cookieParser());

// JSON parser for requests
app.use(express.json({ limit: '10kb' })); // Limit request size

// ============================================
// STATIC FILES
// ============================================

// Serve files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// Health endpoint to check that the server is running
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Catch-all route for SPA (returns index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Do not expose error details in production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Internal server error'
    });
});

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secureapp';

        await mongoose.connect(mongoURI, {
            // Recommended connection options
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
        console.log(`URL: http://localhost:${PORT}`);
    });
};

startServer();

module.exports = app;
