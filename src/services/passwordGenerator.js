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
      numbers: '' // Sera remplacé par un chiffre aléatoire
    };
  }

  // Génération aléatoire (mode Random)
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
      throw new Error('Au moins un type de caractère doit être sélectionné');
    }

    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % charset.length;
      password += charset[randomIndex];
    }

    return password;
  }

  // Génération mémorable (mode Memorable) - comme Proton Pass
  generateMemorable(options = {}) {
    const {
      wordCount = 5,
      includeNumbers = true,
      capitalizeWords = true,
      separator = 'hyphens'
    } = options;

    const words = [];

    // Sélectionner des mots aléatoires
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = crypto.randomBytes(2).readUInt16BE(0) % frenchWords.length;
      let word = frenchWords[randomIndex];

      // Capitaliser si demandé
      if (capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        word = word.toLowerCase();
      }

      // Ajouter un chiffre si demandé
      if (includeNumbers) {
        const digit = crypto.randomBytes(1)[0] % 10;
        word += digit;
      }

      words.push(word);
    }

    // Gérer le séparateur
    if (separator === 'numbers') {
      // Utiliser des chiffres aléatoires comme séparateur
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

  // Méthode principale qui délègue selon le type
  generate(options = {}) {
    const { type = 'random', mode = 'random' } = options;

    // Accepter 'mode' ou 'type'
    const generationType = mode || type;

    if (generationType === 'memorable') {
      return this.generateMemorable(options);
    }

    return this.generateRandom(options);
  }
}

module.exports = new PasswordGenerator();
