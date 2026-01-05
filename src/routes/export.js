const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Export des mots de passe au format CSV
router.post('/passwords/csv', exportController.exportPasswordsCSV);

// Export des mots de passe au format JSON
router.post('/passwords/json', exportController.exportPasswordsJSON);

// Export de l'historique au format CSV
router.get('/history/csv', exportController.exportHistoryCSV);

// Export complet (mots de passe + historique + gamification)
router.post('/complete', exportController.exportComplete);

module.exports = router;
