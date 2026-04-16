/**
 * Middleware: additional security headers
 * Author: Rodney (Security Analyst)
 *
 * Complements Helmet.js with application-specific headers
 * aligned with ANSSI and OWASP recommendations.
 */

/**
 * Set additional security response headers.
 * Applied after Helmet so these take precedence where needed.
 */
function additionalSecurityHeaders(req, res, next) {
  // Prevent caching of sensitive API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Restrict referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Control browser features available to the app
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Explicitly deny embedding in frames (belt-and-suspenders with Helmet)
  res.setHeader('X-Frame-Options', 'DENY');

  next();
}

module.exports = { additionalSecurityHeaders };
