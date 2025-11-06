/**
 * Security Headers Configuration
 * Helmet-like security headers for HTTP responses
 */

/**
 * Get security headers for HTTP responses
 * @param {Object} options - Configuration options
 * @returns {Object} Headers object
 */
export function getSecurityHeaders(options = {}) {
  const {
    enableHSTS = process.env.NODE_ENV === 'production',
    allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [],
  } = options;

  const headers = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS filter in older browsers
    'X-XSS-Protection': '1; mode=block',
    
    // Control iframe embedding
    'X-Frame-Options': 'SAMEORIGIN',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (formerly Feature-Policy)
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
    ].join(', '),
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Three.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' ${allowedOrigins.join(' ')} ws: wss:`,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  };

  // HSTS in production only
  if (enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

/**
 * Apply security headers to HTTP response
 * @param {Object} res - HTTP response object
 * @param {Object} options - Configuration options
 */
export function applySecurityHeaders(res, options = {}) {
  const headers = getSecurityHeaders(options);
  
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

/**
 * Middleware to apply security headers to all responses
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
export function securityHeadersMiddleware(options = {}) {
  return (req, res, next) => {
    applySecurityHeaders(res, options);
    next();
  };
}

export default {
  getSecurityHeaders,
  applySecurityHeaders,
  securityHeadersMiddleware,
};
