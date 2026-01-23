/**
 * Routes d'Authentification
 * Définit les endpoints pour l'inscription, connexion et gestion des utilisateurs
 *
 * SÉCURITÉ : Le token JWT est transmis via cookie HTTP-only (pas dans le corps JSON)
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

// ============================================
// ROUTES PUBLIQUES (pas de token requis)
// ============================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 * Le token est renvoyé dans un cookie HTTP-only
 */
router.post('/register',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Le nom est requis')
            .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
        body('email')
            .isEmail().withMessage('Email invalide')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    ],
    authController.register
);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 * Le token est renvoyé dans un cookie HTTP-only
 * Rate limiting appliqué pour éviter le brute force
 */
router.post('/login',
    loginLimiter,
    [
        body('email')
            .isEmail().withMessage('Email invalide')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Mot de passe requis')
    ],
    authController.login
);

/**
 * POST /api/auth/logout
 * Déconnexion - supprime le cookie contenant le token
 */
router.post('/logout', authController.logout);

// ============================================
// ROUTES PROTÉGÉES (token JWT requis dans le cookie)
// ============================================

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté
 * Utilisé pour vérifier si la session est active
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Mise à jour du profil de l'utilisateur connecté
 */
router.put('/profile',
    authMiddleware,
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Le nom est requis'),
        body('email')
            .isEmail().withMessage('Email invalide')
            .normalizeEmail()
    ],
    authController.updateProfile
);

/**
 * PUT /api/auth/password
 * Changement du mot de passe de l'utilisateur connecté
 */
router.put('/password',
    authMiddleware,
    [
        body('currentPassword')
            .notEmpty().withMessage('Mot de passe actuel requis'),
        body('newPassword')
            .isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    ],
    authController.changePassword
);

// ============================================
// ROUTES ADMIN (token JWT + rôle admin requis)
// ============================================

/**
 * GET /api/auth/users
 * Liste de tous les utilisateurs (admin uniquement)
 */
router.get('/users',
    authMiddleware,
    authController.getAllUsers
);

/**
 * PUT /api/auth/users/:id/role
 * Modification du rôle d'un utilisateur (admin uniquement)
 */
router.put('/users/:id/role',
    authMiddleware,
    [
        body('role')
            .isIn(['user', 'admin']).withMessage('Rôle invalide')
    ],
    authController.updateUserRole
);

/**
 * DELETE /api/auth/users/:id
 * Suppression d'un utilisateur (admin uniquement)
 */
router.delete('/users/:id',
    authMiddleware,
    authController.deleteUser
);

module.exports = router;
