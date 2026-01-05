const calculateEntropy = (password) => {
  let charset = 0;

  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

  const entropy = password.length * Math.log2(charset);
  return Math.round(entropy * 10) / 10;
};

const getPasswordStrength = (entropy) => {
  if (entropy < 28) return 'Très faible';
  if (entropy < 36) return 'Faible';
  if (entropy < 60) return 'Moyen';
  if (entropy < 80) return 'Fort';
  return 'Très fort';
};

// Calculer le temps estimé pour craquer le mot de passe
const calculateCrackTime = (entropy) => {
  // Hypothèse : 10 milliards de tentatives par seconde (attaque moderne)
  const attemptsPerSecond = 10000000000;
  const possibleCombinations = Math.pow(2, entropy);
  const secondsToCrack = possibleCombinations / (2 * attemptsPerSecond);

  if (secondsToCrack < 1) {
    return 'Instantané';
  } else if (secondsToCrack < 60) {
    return `${Math.round(secondsToCrack)} secondes`;
  } else if (secondsToCrack < 3600) {
    const minutes = Math.round(secondsToCrack / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 86400) {
    const hours = Math.round(secondsToCrack / 3600);
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 2592000) {
    const days = Math.round(secondsToCrack / 86400);
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 31536000) {
    const months = Math.round(secondsToCrack / 2592000);
    return `${months} mois`;
  } else if (secondsToCrack < 3153600000) {
    const years = Math.round(secondsToCrack / 31536000);
    return `${years} an${years > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 31536000000) {
    const decades = Math.round(secondsToCrack / 315360000);
    return `${decades} décennie${decades > 1 ? 's' : ''}`;
  } else {
    const millennia = Math.round(secondsToCrack / 31536000000);
    if (millennia < 1000) {
      return `${millennia} siècle${millennia > 1 ? 's' : ''}`;
    }
    return 'des milliers d\'années';
  }
};

module.exports = { calculateEntropy, getPasswordStrength, calculateCrackTime };
