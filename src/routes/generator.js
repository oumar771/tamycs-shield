const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const authMiddleware = require('../middleware/auth');

// Route publique pour générer un mot de passe
router.post('/generate', generatorController.generatePassword);

// Route publique pour générer plusieurs suggestions
router.post('/multiple', generatorController.generateMultiple);

// Route protégée pour sauvegarder un mot de passe généré
router.use(authMiddleware);

module.exports = router;
