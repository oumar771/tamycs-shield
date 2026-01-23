/**
 * Application de Gestion de Comptes Utilisateurs
 * Serveur Express avec MongoDB
 *
 * Projet Programmation Sécurisée - ESAIP
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

// Helmet ajoute des headers HTTP de sécurité
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
    // Protection contre le clickjacking
    frameguard: { action: 'deny' },
    // Force HTTPS
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    },
    // Désactive la détection MIME
    noSniff: true,
    // Protection XSS
    xssFilter: true
}));

// Configuration CORS avec credentials pour les cookies
app.use(cors({
    origin: process.env.CORS_ORIGIN || true, // true permet toutes les origines en dev
    credentials: true // Permet l'envoi des cookies
}));

// Parser pour les cookies (nécessaire pour lire le token JWT)
app.use(cookieParser());

// Parser JSON pour les requêtes
app.use(express.json({ limit: '10kb' })); // Limite la taille des requêtes

// ============================================
// FICHIERS STATIQUES
// ============================================

// Servir les fichiers du dossier public
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// ROUTES API
// ============================================

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Endpoint de santé pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Serveur en fonctionnement',
        timestamp: new Date().toISOString()
    });
});

// Route catch-all pour le SPA (renvoie index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// GESTION DES ERREURS
// ============================================

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err.stack);

    // Ne pas exposer les détails des erreurs en production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Erreur serveur interne'
    });
});

// ============================================
// CONNEXION BASE DE DONNÉES
// ============================================

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secureapp';

        await mongoose.connect(mongoURI, {
            // Options de connexion recommandées
        });

        console.log('MongoDB connecté avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
        console.log(`URL: http://localhost:${PORT}`);
    });
};

startServer();

module.exports = app;
