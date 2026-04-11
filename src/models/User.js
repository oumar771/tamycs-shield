/**
 * User Model
 * Manages user data with secure password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema definition
const userSchema = new mongoose.Schema({
    // User's name
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    // Unique email for authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    // Hashed password (never stored in plain text)
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    // User role (user or admin)
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Account creation date
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Last login date
    lastLogin: {
        type: Date,
        default: null
    }
});

/**
 * Pre-save middleware to hash the password
 * Uses bcrypt with a cost factor of 12
 */
userSchema.pre('save', async function(next) {
    // Only hash if the password has been modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hashing with bcrypt (12 rounds = good security/performance balance)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare a plain text password with the hash
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if the password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to return user data without the password
 * @returns {Object} Safe user data
 */
userSchema.methods.toSafeObject = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        createdAt: this.createdAt,
        lastLogin: this.lastLogin
    };
};

module.exports = mongoose.model('User', userSchema);
