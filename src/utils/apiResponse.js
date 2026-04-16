/**
 * Utility: standardized API response helpers
 * Author: Fresnel (Backend Developer & Tester)
 *
 * Ensures all API endpoints return a consistent JSON structure,
 * making error handling on the frontend predictable.
 *
 * Success shape  : { success: true,  data: ..., message?: ... }
 * Error shape    : { success: false, error: { code, message } }
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
function sendSuccess(res, data, message = null, statusCode = 200) {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

/**
 * Send a created (201) response.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message]
 */
function sendCreated(res, data, message = 'Resource created') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {string} [code]
 */
function sendError(res, message, statusCode = 500, code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

/**
 * Send a 400 Bad Request response.
 */
function sendBadRequest(res, message, code = 'BAD_REQUEST') {
  return sendError(res, message, 400, code);
}

/**
 * Send a 401 Unauthorized response.
 */
function sendUnauthorized(res, message = 'Authentication required') {
  return sendError(res, message, 401, 'UNAUTHORIZED');
}

/**
 * Send a 404 Not Found response.
 */
function sendNotFound(res, resource = 'Resource') {
  return sendError(res, `${resource} not found`, 404, 'NOT_FOUND');
}

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendNotFound,
};
