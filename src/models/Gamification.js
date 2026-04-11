const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: {
    passwordsCreated: {
      type: Number,
      default: 0
    },
    strongPasswordsGenerated: {
      type: Number,
      default: 0
    },
    categoriesUsed: {
      type: Number,
      default: 0
    },
    consecutiveLoginDays: {
      type: Number,
      default: 0
    },
    lastLoginDate: Date
  },
  statistics: {
    totalPasswordsGenerated: {
      type: Number,
      default: 0
    },
    totalPasswordsSaved: {
      type: Number,
      default: 0
    },
    averagePasswordStrength: {
      type: Number,
      default: 0
    },
    mostUsedCategory: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calcul du niveau basé sur les points
gamificationSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.points / 100) + 1;
  return this.level;
};

// Ajout de points
gamificationSchema.methods.addPoints = function(points, reason) {
  this.points += points;
  this.calculateLevel();
  this.updatedAt = Date.now();
  return this.save();
};

// Vérification et attribution de badges
gamificationSchema.methods.checkAndAwardBadges = function() {
  const newBadges = [];

  // Badge Premier Pas
  if (this.achievements.passwordsCreated === 1 && !this.hasBadge('first_password')) {
    newBadges.push({
      name: 'first_password',
      description: 'Premier mot de passe créé',
      icon: 'first_step'
    });
  }

  // Badge Gardien
  if (this.achievements.passwordsCreated >= 10 && !this.hasBadge('guardian')) {
    newBadges.push({
      name: 'guardian',
      description: '10 mots de passe créés',
      icon: 'shield'
    });
  }

  // Badge Expert
  if (this.achievements.passwordsCreated >= 50 && !this.hasBadge('expert')) {
    newBadges.push({
      name: 'expert',
      description: '50 mots de passe créés',
      icon: 'star'
    });
  }

  // Badge Sécurité Pro
  if (this.achievements.strongPasswordsGenerated >= 20 && !this.hasBadge('security_pro')) {
    newBadges.push({
      name: 'security_pro',
      description: '20 mots de passe forts générés',
      icon: 'lock'
    });
  }

  // Badge Organisateur
  if (this.achievements.categoriesUsed >= 5 && !this.hasBadge('organizer')) {
    newBadges.push({
      name: 'organizer',
      description: 'Utilise 5 catégories différentes',
      icon: 'folder'
    });
  }

  // Badge Fidèle
  if (this.achievements.consecutiveLoginDays >= 7 && !this.hasBadge('loyal')) {
    newBadges.push({
      name: 'loyal',
      description: '7 jours de connexion consécutifs',
      icon: 'calendar'
    });
  }

  if (newBadges.length > 0) {
    this.badges.push(...newBadges);
    this.updatedAt = Date.now();
  }

  return newBadges;
};

// Vérifier si un badge existe
gamificationSchema.methods.hasBadge = function(badgeName) {
  return this.badges.some(badge => badge.name === badgeName);
};

module.exports = mongoose.model('Gamification', gamificationSchema);
