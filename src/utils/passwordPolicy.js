/**
 * Utility: ANSSI password policy validator
 * Author: Rodney (Security Analyst)
 *
 * Centralizes the password policy so it can be reused in
 * validators.js, the frontend hint system, and unit tests.
 *
 * Reference: ANSSI-PA-082 — Recommandations relatives à
 * l'authentification multifacteur et aux mots de passe (2021)
 */

const POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
  symbolChars: '!@#$%^&*(),.?":{}|<>_+-=[]\\;\' ',
};

/**
 * Validate a master password against the ANSSI policy.
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateMasterPassword(password) {
  const errors = [];

  if (typeof password !== 'string' || password.length < POLICY.minLength) {
    errors.push(`Minimum ${POLICY.minLength} characters required`);
  }
  if (POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter required');
  }
  if (POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter required');
  }
  if (POLICY.requireDigit && !/[0-9]/.test(password)) {
    errors.push('At least one digit required');
  }
  if (POLICY.requireSymbol && !/[!@#$%^&*()\-_=+[\]{}|;':",.<>/?\\]/.test(password)) {
    errors.push('At least one special character required');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { POLICY, validateMasterPassword };
