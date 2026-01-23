/**
 * Modèle Utilisateur
 * Gère les données des utilisateurs avec hashage sécurisé des mots de passe
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
    // Nom de l'utilisateur
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    // Email unique pour l'authentification
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide']
    },
    // Mot de passe hashé (jamais stocké en clair)
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
    },
    // Rôle de l'utilisateur (user ou admin)
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Date de création du compte
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Date de dernière connexion
    lastLogin: {
        type: Date,
        default: null
    }
});

/**
 * Middleware pre-save pour hasher le mot de passe
 * Utilise bcrypt avec un facteur de coût de 12
 */
userSchema.pre('save', async function(next) {
    // Ne hasher que si le mot de passe a été modifié
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hashage avec bcrypt (12 rounds = bon équilibre sécurité/performance)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Méthode pour comparer un mot de passe en clair avec le hash
 * @param {string} candidatePassword - Mot de passe à vérifier
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Méthode pour retourner les données utilisateur sans le mot de passe
 * @returns {Object} Données utilisateur sécurisées
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
