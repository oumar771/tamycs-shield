/**
 * Middleware: security audit logger
 * Author: Rodney (Security Analyst)
 *
 * Logs security-relevant events (authentication attempts, CRUD on passwords)
 * for audit trail purposes. Output format is structured JSON for easy parsing.
 */

const SENSITIVE_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/passwords',
  '/api/export',
];

/**
 * Log incoming request metadata for security auditing.
 * Does NOT log request bodies to avoid capturing plaintext passwords.
 */
function auditLog(req, res, next) {
  const isSensitive = SENSITIVE_PATHS.some((p) => req.path.startsWith(p));
  if (!isSensitive) return next();

  const start = Date.now();

  res.on('finish', () => {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'unknown',
      durationMs: Date.now() - start,
      userId: req.user ? req.user.id : null,
    };

    // Flag suspicious activity
    if (res.statusCode === 401 || res.statusCode === 429) {
      entry.alert = res.statusCode === 429 ? 'RATE_LIMIT_HIT' : 'AUTH_FAILURE';
    }

    // In production, pipe to a proper logging service (e.g. Winston, Datadog)
    console.log('[AUDIT]', JSON.stringify(entry));
  });

  next();
}

module.exports = { auditLog };
