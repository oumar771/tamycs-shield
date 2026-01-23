/**
 * Controller d'Authentification
 * Gère l'inscription, la connexion, la gestion du profil et l'administration des utilisateurs
 *
 * SÉCURITÉ : Le token JWT est envoyé via un cookie HTTP-only pour éviter les attaques XSS
 */

const User = require('../models/User');
const { generateAccessToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

// Configuration du cookie sécurisé
const COOKIE_OPTIONS = {
    httpOnly: true,     // Empêche l'accès au cookie via JavaScript (protection XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    sameSite: 'strict', // Protection CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 heures en millisecondes
};

/**
 * Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        // Vérifier les erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: 'user' // Par défaut, tous les nouveaux utilisateurs sont des "user"
        });

        await user.save();

        // Générer le token JWT
        const token = generateAccessToken(user._id);

        // Envoyer le token dans un cookie HTTP-only sécurisé
        res.cookie('token', token, COOKIE_OPTIONS);

        // Retourner les données utilisateur (sans le token dans le corps)
        res.status(201).json({
            message: 'Compte créé avec succès',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
};

/**
 * Connexion d'un utilisateur
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation basique
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Rechercher l'utilisateur par email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Message générique pour éviter l'énumération des utilisateurs
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // Mettre à jour la date de dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer le token JWT
        const token = generateAccessToken(user._id);

        // Envoyer le token dans un cookie HTTP-only sécurisé
        res.cookie('token', token, COOKIE_OPTIONS);

        // Retourner les données utilisateur (sans le token dans le corps)
        res.json({
            message: 'Connexion réussie',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
};

/**
 * Déconnexion d'un utilisateur
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
    // Supprimer le cookie en le remplaçant par un cookie expiré
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) // Date dans le passé = cookie expiré
    });

    res.json({ message: 'Déconnexion réussie' });
};

/**
 * Récupérer l'utilisateur courant (pour vérifier la session)
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user: user.toSafeObject() });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Mise à jour du profil utilisateur
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.userId;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Nom et email requis' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour l'utilisateur
        const user = await User.findByIdAndUpdate(
            userId,
            { name, email: email.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            message: 'Profil mis à jour',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Changement de mot de passe
 * PUT /api/auth/password
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Mots de passe requis' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
        }

        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier l'ancien mot de passe
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save(); // Le middleware pre-save hashera automatiquement

        res.json({ message: 'Mot de passe modifié avec succès' });

    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Liste de tous les utilisateurs (admin uniquement)
 * GET /api/auth/users
 */
exports.getAllUsers = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Récupérer tous les utilisateurs
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        res.json({
            users: users.map(user => user.toSafeObject())
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Modification du rôle d'un utilisateur (admin uniquement)
 * PUT /api/auth/users/:id/role
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const targetUserId = req.params.id;

        // Vérifier que l'utilisateur est admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Validation du rôle
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' });
        }

        // Empêcher un admin de se retirer ses propres droits admin
        if (targetUserId === req.userId.toString() && role !== 'admin') {
            return res.status(400).json({ error: 'Vous ne pouvez pas retirer vos propres droits admin' });
        }

        // Mettre à jour le rôle
        const user = await User.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            message: 'Rôle mis à jour',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Suppression d'un utilisateur (admin uniquement)
 * DELETE /api/auth/users/:id
 */
exports.deleteUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        // Vérifier que l'utilisateur est admin
        const requestingUser = await User.findById(req.userId);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Empêcher un admin de se supprimer lui-même
        if (targetUserId === req.userId.toString()) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        // Supprimer l'utilisateur
        const user = await User.findByIdAndDelete(targetUserId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Utilisateur supprimé' });

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
