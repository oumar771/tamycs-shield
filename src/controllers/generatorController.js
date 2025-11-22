const passwordGenerator = require('../services/passwordGenerator');
const { calculateEntropy, getPasswordStrength } = require('../utils/entropy');

exports.generatePassword = (req, res) => {
  try {
    const options = req.body;
    const password = passwordGenerator.generate(options);
    const entropy = calculateEntropy(password);
    const strength = getPasswordStrength(entropy);

    res.json({
      password,
      entropy,
      strength,
      length: password.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
