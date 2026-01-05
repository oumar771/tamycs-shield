const Gamification = require('../models/Gamification');
const Password = require('../models/Password');
const PasswordHistory = require('../models/PasswordHistory');

// Récupérer les données de gamification de l'utilisateur
exports.getGamificationData = async (req, res) => {
  try {
    const userId = req.userId;

    let gamification = await Gamification.findOne({ userId });

    if (!gamification) {
      gamification = new Gamification({ userId });
      await gamification.save();
    }

    res.json(gamification);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Récupérer le tableau de bord (dashboard) avec statistiques
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const gamification = await Gamification.findOne({ userId });
    const totalPasswords = await Password.countDocuments({ userId });
    const totalGenerated = await PasswordHistory.countDocuments({ userId });

    const passwordsByCategory = await Password.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentPasswords = await Password.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');

    const recentGenerated = await PasswordHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('length strength entropy createdAt used');

    const strongPasswords = await PasswordHistory.countDocuments({
      userId,
      strength: { $in: ['Fort', 'Très fort'] }
    });

    res.json({
      gamification: gamification || { points: 0, level: 1, badges: [] },
      statistics: {
        totalPasswords,
        totalGenerated,
        strongPasswords,
        passwordsByCategory,
        recentPasswords,
        recentGenerated
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Récupérer l'historique complet des mots de passe générés
exports.getPasswordHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, skip = 0, strength } = req.query;

    const filter = { userId };
    if (strength) {
      filter.strength = strength;
    }

    const history = await PasswordHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await PasswordHistory.countDocuments(filter);

    res.json({
      history,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Ajouter un mot de passe à l'historique
exports.addToHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { password, length, options, strength, entropy } = req.body;

    const historyEntry = new PasswordHistory({
      userId,
      generatedPassword: password,
      length,
      options,
      strength,
      entropy
    });

    await historyEntry.save();

    // Mettre à jour les statistiques de gamification
    let gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      gamification = new Gamification({ userId });
    }

    gamification.statistics.totalPasswordsGenerated += 1;

    if (strength === 'Fort' || strength === 'Très fort') {
      gamification.achievements.strongPasswordsGenerated += 1;
      await gamification.addPoints(5, 'Strong password generated');
    } else {
      await gamification.addPoints(2, 'Password generated');
    }

    const newBadges = gamification.checkAndAwardBadges();
    await gamification.save();

    res.json({
      success: true,
      historyEntry,
      newBadges,
      points: gamification.points,
      level: gamification.level
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Marquer un mot de passe de l'historique comme utilisé
exports.markAsUsed = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { usedFor } = req.body;
    const userId = req.userId;

    const historyEntry = await PasswordHistory.findOne({
      _id: historyId,
      userId
    });

    if (!historyEntry) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }

    historyEntry.used = true;
    historyEntry.usedFor = usedFor;
    await historyEntry.save();

    res.json({ success: true, historyEntry });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};
