const passwordGenerator = require('../services/passwordGenerator');
const { calculateEntropy, getPasswordStrength, calculateCrackTime } = require('../utils/entropy');
const PasswordHistory = require('../models/PasswordHistory');

exports.generatePassword = async (req, res) => {
  try {
    const options = req.body;
    const password = passwordGenerator.generate(options);
    const entropy = calculateEntropy(password);
    const strength = getPasswordStrength(entropy);
    const crackTime = calculateCrackTime(entropy);

    // Save to history if user is logged in
    if (req.userId) {
      const historyEntry = new PasswordHistory({
        userId: req.userId,
        generatedPassword: password,
        length: password.length,
        options: {
          type: options.type || 'random',
          ...options
        },
        strength,
        entropy
      });
      await historyEntry.save();
    }

    res.json({
      password,
      entropy,
      strength,
      crackTime,
      length: password.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate multiple password suggestions
exports.generateMultiple = async (req, res) => {
  try {
    const { count = 8, ...options } = req.body;
    const suggestions = [];

    for (let i = 0; i < Math.min(count, 20); i++) {
      const password = passwordGenerator.generate(options);
      const entropy = calculateEntropy(password);
      const strength = getPasswordStrength(entropy);
      const crackTime = calculateCrackTime(entropy);

      suggestions.push({
        password,
        entropy,
        strength,
        crackTime
      });
    }

    res.json({ passwords: suggestions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
