/**
 * Middleware d'Authentification
 * Vérifie le token JWT depuis le cookie HTTP-only et ajoute l'ID utilisateur à la requête
 *
 * SÉCURITÉ : Le token est lu depuis un cookie HTTP-only, pas depuis le header Authorization
 * Cela protège contre les attaques XSS car JavaScript ne peut pas accéder au cookie
 */

const { verifyToken } = require('../utils/jwt');

/**
 * Middleware qui vérifie la présence et la validité du token JWT dans le cookie
 * Ajoute req.userId si le token est valide
 */
const authMiddleware = (req, res, next) => {
    // Récupérer le token depuis le cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            error: 'Accès refusé. Veuillez vous connecter.'
        });
    }

    // Vérifier le token
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            error: 'Session expirée. Veuillez vous reconnecter.'
        });
    }

    // Ajouter l'ID utilisateur à la requête pour les routes suivantes
    req.userId = decoded.userId;
    next();
};

module.exports = authMiddleware;
