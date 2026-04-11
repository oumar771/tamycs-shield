/*
 * authController.js
 * Authentication and user management
 */

const User = require('../models/User');
const { generateAccessToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

// Cookie options for the JWT token
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24h
};

// POST /api/auth/register - Registration
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        // Check if email is already taken
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'This email is already in use' });
        }

        // Create the user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: 'user'
        });

        await user.save();

        // Token stored in an httpOnly cookie
        const token = generateAccessToken(user._id);
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'Account created successfully',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/auth/login - Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateAccessToken(user._id);
        res.cookie('token', token, COOKIE_OPTIONS);

        res.json({
            message: 'Login successful',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/auth/logout - Logout
exports.logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me - Current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: user.toSafeObject() });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/auth/profile - Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check that email is not taken by another user
        const existing = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.userId }
        });
        if (existing) {
            return res.status(400).json({ error: 'This email is already in use' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, email: email.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated', user: user.toSafeObject() });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/auth/password - Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Passwords are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Minimum 8 characters' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/auth/users - List users (admin)
exports.getAllUsers = async (req, res) => {
    try {
        const admin = await User.findById(req.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ users: users.map(u => u.toSafeObject()) });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/auth/users/:id/role - Update role (admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const targetId = req.params.id;

        const admin = await User.findById(req.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // An admin cannot remove their own admin rights
        if (targetId === req.userId.toString() && role !== 'admin') {
            return res.status(400).json({ error: 'Action not allowed' });
        }

        const user = await User.findByIdAndUpdate(targetId, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Role updated', user: user.toSafeObject() });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/auth/users/:id - Delete a user (admin)
exports.deleteUser = async (req, res) => {
    try {
        const targetId = req.params.id;

        const admin = await User.findById(req.userId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        if (targetId === req.userId.toString()) {
            return res.status(400).json({ error: 'Action not allowed' });
        }

        const user = await User.findByIdAndDelete(targetId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
