/**
 * Utility: pagination helper
 * Author: Fresnel (Backend Developer & Tester)
 *
 * Provides reusable pagination logic for list endpoints.
 * Avoids duplicating limit/skip logic across controllers.
 */

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

/**
 * Parse and validate pagination query parameters.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query = {}) {
  let page  = parseInt(query.page,  10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page  < 1)         page  = DEFAULT_PAGE;
  if (limit < 1)         limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a standard pagination response envelope.
 * @param {any[]} data
 * @param {number} total - total number of documents
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
function paginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
