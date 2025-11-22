const calculateEntropy = (password) => {
  let charset = 0;

  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

  const entropy = password.length * Math.log2(charset);
  return Math.round(entropy);
};

const getPasswordStrength = (entropy) => {
  if (entropy < 28) return 'Très faible';
  if (entropy < 36) return 'Faible';
  if (entropy < 60) return 'Moyen';
  if (entropy < 128) return 'Fort';
  return 'Très fort';
};

module.exports = { calculateEntropy, getPasswordStrength };
