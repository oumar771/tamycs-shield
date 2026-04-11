const crypto = require('crypto');
const frenchWords = require('../data/wordlist');

class PasswordGenerator {
  constructor() {
    this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.digits = '0123456789';
    this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    this.separators = {
      hyphens: '-',
      periods: '.',
      slashes: '/',
      underscores: '_',
      spaces: ' ',
      commas: ',',
      numbers: '' // Will be replaced by a random digit
    };
  }

  // Random generation (Random mode)
  generateRandom(options = {}) {
    const {
      length = 16,
      includeLowercase = true,
      includeUppercase = true,
      includeDigits = true,
      includeSymbols = true
    } = options;

    let charset = '';
    if (includeLowercase) charset += this.lowercase;
    if (includeUppercase) charset += this.uppercase;
    if (includeDigits) charset += this.digits;
    if (includeSymbols) charset += this.symbols;

    if (!charset) {
      throw new Error('At least one character type must be selected');
    }

    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % charset.length;
      password += charset[randomIndex];
    }

    return password;
  }

  // Memorable generation (Memorable mode) - inspired by Proton Pass
  generateMemorable(options = {}) {
    const {
      wordCount = 5,
      includeNumbers = true,
      capitalizeWords = true,
      separator = 'hyphens'
    } = options;

    const words = [];

    // Select random words
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = crypto.randomBytes(2).readUInt16BE(0) % frenchWords.length;
      let word = frenchWords[randomIndex];

      // Capitalize if requested
      if (capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        word = word.toLowerCase();
      }

      // Add a digit if requested
      if (includeNumbers) {
        const digit = crypto.randomBytes(1)[0] % 10;
        word += digit;
      }

      words.push(word);
    }

    // Handle separator
    if (separator === 'numbers') {
      // Use random digits as separator
      return words.map((word, index) => {
        if (index === words.length - 1) return word;
        const randomDigit = crypto.randomBytes(1)[0] % 10;
        return word + randomDigit;
      }).join('');
    } else {
      const selectedSeparator = this.separators[separator] || '-';
      return words.join(selectedSeparator);
    }
  }

  // Main method that delegates based on type
  generate(options = {}) {
    const { type = 'random', mode = 'random' } = options;

    // Accept 'mode' or 'type'
    const generationType = mode || type;

    if (generationType === 'memorable') {
      return this.generateMemorable(options);
    }

    return this.generateRandom(options);
  }
}

module.exports = new PasswordGenerator();
