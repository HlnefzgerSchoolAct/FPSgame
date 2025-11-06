/**
 * CORS Configuration
 * Cross-Origin Resource Sharing configuration for API endpoints
 */

/**
 * Get CORS configuration
 * @returns {Object} CORS configuration
 */
export function getCorsConfig() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:8080', 'http://localhost:5173'];

  return {
    allowedOrigins,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours
    credentials: true,
  };
}

/**
 * Check if origin is allowed
 * @param {string} origin - Origin to check
 * @returns {boolean} True if origin is allowed
 */
export function isOriginAllowed(origin) {
  if (!origin) return false;
  
  const { allowedOrigins } = getCorsConfig();
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed === '*') return true;
    
    // Convert wildcard pattern to regex
    if (allowed.includes('*')) {
      const pattern = allowed
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) return true;
    }
  }
  
  return false;
}

/**
 * Apply CORS headers to response
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {boolean} True if origin is allowed
 */
export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const config = getCorsConfig();
  
  // Check if origin is allowed
  if (!isOriginAllowed(origin)) {
    return false;
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', config.maxAge.toString());
  
  if (config.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  return true;
}

/**
 * CORS middleware for HTTP endpoints
 * @returns {Function} Middleware function
 */
export function corsMiddleware() {
  return (req, res, next) => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      if (applyCorsHeaders(req, res)) {
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 403;
        res.end('Origin not allowed');
      }
      return;
    }
    
    // Apply CORS headers
    applyCorsHeaders(req, res);
    next();
  };
}

/**
 * Validate WebSocket origin
 * @param {Object} req - WebSocket upgrade request
 * @returns {boolean} True if origin is allowed
 */
export function validateWebSocketOrigin(req) {
  const origin = req.headers.origin;
  return isOriginAllowed(origin);
}

export default {
  getCorsConfig,
  isOriginAllowed,
  applyCorsHeaders,
  corsMiddleware,
  validateWebSocketOrigin,
};
