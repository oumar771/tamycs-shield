/**
 * Middleware de Rate Limiting
 * Protège contre les attaques par force brute
 */

const rateLimit = require('express-rate-limit');

/**
 * Limiteur pour les tentatives de connexion
 * Maximum 5 tentatives par fenêtre de 15 minutes
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 5, // Maximum 5 tentatives
    message: {
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true, // Renvoie les infos rate limit dans les headers
    legacyHeaders: false,
    // Personnalisation de la clé (par défaut: IP)
    keyGenerator: (req) => {
        return req.ip;
    }
});

/**
 * Limiteur général pour l'API
 * Maximum 100 requêtes par minute
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // Fenêtre de 1 minute
    max: 100, // Maximum 100 requêtes
    message: {
        error: 'Trop de requêtes. Veuillez patienter.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter
};
