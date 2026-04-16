/**
 * Utility: password strength evaluation
 * Author: Oumar Touré
 *
 * Provides detailed strength analysis for the UI strength meter.
 */

/**
 * Returns a score 0-4 and label based on entropy bits.
 * @param {number} entropy - bits of entropy
 * @returns {{ score: number, label: string, color: string }}
 */
function evaluateStrength(entropy) {
  if (entropy < 28) return { score: 0, label: 'Very Weak',  color: '#e53935' };
  if (entropy < 36) return { score: 1, label: 'Weak',       color: '#fb8c00' };
  if (entropy < 60) return { score: 2, label: 'Fair',       color: '#fdd835' };
  if (entropy < 80) return { score: 3, label: 'Strong',     color: '#43a047' };
  return               { score: 4, label: 'Very Strong', color: '#1b5e20' };
}

/**
 * Estimate crack time in human-readable form.
 * Assumes 10 billion attempts per second (GPU attack).
 * @param {number} entropy - bits of entropy
 * @returns {string}
 */
function estimateCrackTime(entropy) {
  const combinations = Math.pow(2, entropy);
  const attemptsPerSecond = 1e10;
  const seconds = combinations / (2 * attemptsPerSecond); // average case

  if (seconds < 1)        return 'Instant';
  if (seconds < 60)       return `${Math.round(seconds)} seconds`;
  if (seconds < 3600)     return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400)    return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;

  const years = seconds / 31536000;
  if (years < 1000)        return `${Math.round(years)} years`;
  if (years < 1e6)         return `${(years / 1000).toFixed(1)}k years`;
  if (years < 1e9)         return `${(years / 1e6).toFixed(1)} million years`;
  return 'Billions of years';
}

module.exports = { evaluateStrength, estimateCrackTime };
