/**
 * Utilitaires JWT
 * Gère la génération et la vérification des tokens JWT
 */

const jwt = require('jsonwebtoken');

// Clé secrète par défaut (doit être définie dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production';

/**
 * Génère un token d'accès JWT
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Token JWT signé
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '24h' } // Token valide 24 heures
    );
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object|null} Payload décodé ou null si invalide
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
