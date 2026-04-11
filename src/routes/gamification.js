const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Récupérer les données de gamification
router.get('/data', gamificationController.getGamificationData);

// Récupérer le tableau de bord avec statistiques
router.get('/dashboard', gamificationController.getDashboard);

// Récupérer l'historique des mots de passe générés
router.get('/history', gamificationController.getPasswordHistory);

// Ajouter un mot de passe à l'historique
router.post('/history', gamificationController.addToHistory);

// Marquer un mot de passe de l'historique comme utilisé
router.patch('/history/:historyId/use', gamificationController.markAsUsed);

module.exports = router;
