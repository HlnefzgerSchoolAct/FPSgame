/**
 * Rate Limiting Middleware
 * Token bucket rate limiter for API endpoints
 */

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  getState() {
    this.refill();
    return {
      tokens: Math.floor(this.tokens),
      capacity: this.capacity,
      remaining: Math.floor(this.tokens),
    };
  }
}

class RateLimiter {
  constructor(options = {}) {
    this.rps = options.rps || parseInt(process.env.RATE_LIMIT_RPS) || 100;
    this.capacity = options.capacity || this.rps * 2; // 2 seconds burst
    this.buckets = new Map();
    this.cleanupInterval = options.cleanupInterval || 300000; // 5 minutes
    
    // Start cleanup
    this.startCleanup();
  }

  getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new TokenBucket(this.capacity, this.rps));
    }
    return this.buckets.get(key);
  }

  checkLimit(key, tokens = 1) {
    const bucket = this.getBucket(key);
    const allowed = bucket.consume(tokens);
    const state = bucket.getState();
    
    return {
      allowed,
      limit: this.capacity,
      remaining: state.remaining,
      retryAfter: allowed ? null : Math.ceil((tokens - state.tokens) / this.rps),
    };
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      const timeout = 600000; // 10 minutes
      
      for (const [key, bucket] of this.buckets.entries()) {
        if (now - bucket.lastRefill > timeout) {
          this.buckets.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  reset(key) {
    this.buckets.delete(key);
  }

  getStats() {
    return {
      totalKeys: this.buckets.size,
      rps: this.rps,
      capacity: this.capacity,
    };
  }
}

// Global rate limiter instance
let globalRateLimiter = null;

/**
 * Get or create global rate limiter
 * @param {Object} options - Rate limiter options
 * @returns {RateLimiter} Rate limiter instance
 */
export function getRateLimiter(options = {}) {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(options);
  }
  return globalRateLimiter;
}

/**
 * Get client identifier from request
 * @param {Object} req - HTTP request
 * @returns {string} Client identifier
 */
export function getClientId(req) {
  // Try X-Forwarded-For first (behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Try X-Real-IP
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  // Fall back to socket address
  return req.socket.remoteAddress;
}

/**
 * Rate limiting middleware
 * @param {Object} options - Middleware options
 * @returns {Function} Middleware function
 */
export function rateLimitMiddleware(options = {}) {
  const limiter = getRateLimiter(options);
  const tokens = options.tokens || 1;
  
  return (req, res, next) => {
    const clientId = getClientId(req);
    const result = limiter.checkLimit(clientId, tokens);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter.toString());
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: result.retryAfter,
      }));
      return;
    }
    
    next();
  };
}

/**
 * WebSocket rate limiter
 * @param {string} clientId - Client identifier
 * @param {number} tokens - Tokens to consume
 * @returns {Object} Rate limit result
 */
export function checkWebSocketRateLimit(clientId, tokens = 1) {
  const limiter = getRateLimiter();
  return limiter.checkLimit(clientId, tokens);
}

export default {
  getRateLimiter,
  getClientId,
  rateLimitMiddleware,
  checkWebSocketRateLimit,
  TokenBucket,
  RateLimiter,
};
