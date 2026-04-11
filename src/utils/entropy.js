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
  if (entropy < 28) return 'Very weak';
  if (entropy < 36) return 'Weak';
  if (entropy < 60) return 'Fair';
  if (entropy < 80) return 'Strong';
  return 'Very strong';
};

// Estimate time to crack the password
const calculateCrackTime = (entropy) => {
  // Assumption: 10 billion attempts per second (modern attack)
  const attemptsPerSecond = 10000000000;
  const possibleCombinations = Math.pow(2, entropy);
  const secondsToCrack = possibleCombinations / (2 * attemptsPerSecond);

  if (secondsToCrack < 1) {
    return 'Instant';
  } else if (secondsToCrack < 60) {
    return `${Math.round(secondsToCrack)} second${Math.round(secondsToCrack) > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 3600) {
    const minutes = Math.round(secondsToCrack / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 86400) {
    const hours = Math.round(secondsToCrack / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 2592000) {
    const days = Math.round(secondsToCrack / 86400);
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 31536000) {
    const months = Math.round(secondsToCrack / 2592000);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 3153600000) {
    const years = Math.round(secondsToCrack / 31536000);
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (secondsToCrack < 31536000000) {
    const decades = Math.round(secondsToCrack / 315360000);
    return `${decades} decade${decades > 1 ? 's' : ''}`;
  } else {
    const centuries = Math.round(secondsToCrack / 31536000000);
    if (centuries < 1000) {
      return `${centuries} centur${centuries > 1 ? 'ies' : 'y'}`;
    }
    return 'thousands of years';
  }
};

module.exports = { calculateEntropy, getPasswordStrength, calculateCrackTime };
