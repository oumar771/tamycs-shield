class PasswordGenerator {
  constructor() {
    this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.digits = '0123456789';
    this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  generate(options = {}) {
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
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}

module.exports = new PasswordGenerator();
