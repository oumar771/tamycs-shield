const mongoose = require('mongoose');

const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  generatedPassword: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  options: {
    includeLowercase: Boolean,
    includeUppercase: Boolean,
    includeDigits: Boolean,
    includeSymbols: Boolean
  },
  strength: {
    type: String,
    enum: ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  },
  entropy: {
    type: Number
  },
  used: {
    type: Boolean,
    default: false
  },
  usedFor: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances des requêtes
passwordHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PasswordHistory', passwordHistorySchema);
