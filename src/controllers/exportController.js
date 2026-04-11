const Password = require('../models/Password');
const PasswordHistory = require('../models/PasswordHistory');
const Gamification = require('../models/Gamification');
const { decrypt } = require('../utils/crypto');

// Export passwords as CSV
exports.exportPasswordsCSV = async (req, res) => {
  try {
    const userId = req.userId;
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';

    const passwords = await Password.find({ userId });

    const csvHeader = 'Site/Application,Username,Password,URL,Category,Notes,Created At\n';

    const csvRows = passwords.map(pwd => {
      try {
        const decryptedPassword = decrypt(pwd.encryptedPassword, encryptionKey);
        return `"${pwd.title}","${pwd.username || ''}","${decryptedPassword}","${pwd.url || ''}","${pwd.category}","${pwd.notes || ''}","${pwd.createdAt}"`;
      } catch (error) {
        return `"${pwd.title}","${pwd.username || ''}","[DECRYPTION ERROR]","${pwd.url || ''}","${pwd.category}","${pwd.notes || ''}","${pwd.createdAt}"`;
      }
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=tamycs-shield-passwords-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Export passwords as JSON
exports.exportPasswordsJSON = async (req, res) => {
  try {
    const userId = req.userId;
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';

    const passwords = await Password.find({ userId });

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      passwords: passwords.map(pwd => {
        try {
          const decryptedPassword = decrypt(pwd.encryptedPassword, encryptionKey);
          return {
            title: pwd.title,
            username: pwd.username,
            password: decryptedPassword,
            url: pwd.url,
            category: pwd.category,
            notes: pwd.notes,
            createdAt: pwd.createdAt,
            updatedAt: pwd.updatedAt
          };
        } catch (error) {
          return {
            title: pwd.title,
            username: pwd.username,
            password: '[DECRYPTION ERROR]',
            url: pwd.url,
            category: pwd.category,
            notes: pwd.notes,
            createdAt: pwd.createdAt,
            updatedAt: pwd.updatedAt
          };
        }
      })
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tamycs-shield-passwords-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Export generation history as CSV
exports.exportHistoryCSV = async (req, res) => {
  try {
    const userId = req.userId;

    const history = await PasswordHistory.find({ userId }).sort({ createdAt: -1 });

    const csvHeader = 'Password,Length,Strength,Entropy,Used,Used For,Generated At\n';

    const csvRows = history.map(entry =>
      `"${entry.generatedPassword}","${entry.length}","${entry.strength}","${entry.entropy}","${entry.used ? 'Yes' : 'No'}","${entry.usedFor || ''}","${entry.createdAt}"`
    ).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=tamycs-shield-history-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Full export (passwords + history + gamification)
exports.exportComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({ error: 'Master password required' });
    }

    const passwords = await Password.find({ userId });
    const history = await PasswordHistory.find({ userId }).sort({ createdAt: -1 });
    const gamification = await Gamification.findOne({ userId });

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      user: {
        email: req.user.email,
        name: req.user.name
      },
      passwords: passwords.map(pwd => {
        try {
          const decryptedPassword = decrypt(pwd.encryptedPassword, masterPassword);
          return {
            title: pwd.title,
            username: pwd.username,
            password: decryptedPassword,
            url: pwd.url,
            category: pwd.category,
            notes: pwd.notes,
            createdAt: pwd.createdAt,
            updatedAt: pwd.updatedAt
          };
        } catch (error) {
          return {
            title: pwd.title,
            username: pwd.username,
            password: '[DECRYPTION ERROR]',
            url: pwd.url,
            category: pwd.category,
            notes: pwd.notes,
            createdAt: pwd.createdAt,
            updatedAt: pwd.updatedAt
          };
        }
      }),
      history: history.map(entry => ({
        password: entry.generatedPassword,
        length: entry.length,
        strength: entry.strength,
        entropy: entry.entropy,
        used: entry.used,
        usedFor: entry.usedFor,
        createdAt: entry.createdAt
      })),
      gamification: gamification ? {
        points: gamification.points,
        level: gamification.level,
        badges: gamification.badges,
        achievements: gamification.achievements,
        statistics: gamification.statistics
      } : null
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tamycs-shield-complete-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
