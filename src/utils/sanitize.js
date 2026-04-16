/**
 * Utility: input sanitization helpers
 * Author: Oumar Touré
 *
 * Provides lightweight XSS prevention for user-supplied strings
 * rendered in the frontend without a framework.
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape a string for safe HTML insertion.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/]/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * Strip any HTML tags from a string.
 * @param {string} str
 * @returns {string}
 */
function stripTags(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Truncate and trim a string to a maximum length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
}

module.exports = { escapeHtml, stripTags, truncate };
