import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthSystem, authSystem, generateTestToken } from '../../../../server/auth/Auth.js';

describe('AuthSystem', () => {
  let auth;

  beforeEach(() => {
    auth = new AuthSystem();
  });

  afterEach(() => {
    // Clear rate limits between tests
    auth.rateLimits.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty rate limits', () => {
      expect(auth.rateLimits).toBeDefined();
      expect(auth.rateLimits.size).toBe(0);
    });
  });

  describe('generateToken', () => {
    it('should generate a token for a player', () => {
      const playerId = 'player123';
      const token = auth.generateToken(playerId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should include player ID in token payload', () => {
      const playerId = 'player456';
      const token = auth.generateToken(playerId);
      const decoded = auth.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.playerId).toBe(playerId);
    });

    it('should include metadata in token payload', () => {
      const playerId = 'player789';
      const metadata = { role: 'admin', level: 50 };
      const token = auth.generateToken(playerId, metadata);
      const decoded = auth.verifyToken(token);

      expect(decoded.role).toBe('admin');
      expect(decoded.level).toBe(50);
    });

    it('should include issued-at timestamp', () => {
      const playerId = 'playerTimestamp';
      const beforeGeneration = Date.now();
      const token = auth.generateToken(playerId);
      const afterGeneration = Date.now();
      const decoded = auth.verifyToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.iat).toBeGreaterThanOrEqual(beforeGeneration);
      expect(decoded.iat).toBeLessThanOrEqual(afterGeneration);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const playerId = 'validPlayer';
      const token = auth.generateToken(playerId);
      const result = auth.verifyToken(token);

      expect(result).not.toBeNull();
      expect(result.playerId).toBe(playerId);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = auth.verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const result = auth.verifyToken(malformedToken);

      expect(result).toBeNull();
    });

    it('should return null for empty token', () => {
      const result = auth.verifyToken('');

      expect(result).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', () => {
      const playerId = 'authPlayer';
      const token = auth.generateToken(playerId);
      const result = auth.authenticate(token);

      expect(result.success).toBe(true);
      expect(result.playerId).toBe(playerId);
      expect(result.metadata).toBeDefined();
    });

    it('should fail authentication with no token', () => {
      const result = auth.authenticate(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No token provided');
    });

    it('should fail authentication with invalid token', () => {
      const result = auth.authenticate('invalid.token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should include metadata in successful authentication', () => {
      const playerId = 'metaPlayer';
      const metadata = { premium: true };
      const token = auth.generateToken(playerId, metadata);
      const result = auth.authenticate(token);

      expect(result.success).toBe(true);
      expect(result.metadata.premium).toBe(true);
    });
  });

  describe('generateGuestToken', () => {
    it('should generate a guest token', () => {
      const token = auth.generateGuestToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should mark token as guest', () => {
      const token = auth.generateGuestToken();
      const decoded = auth.verifyToken(token);

      expect(decoded.guest).toBe(true);
    });

    it('should generate unique guest IDs', () => {
      const token1 = auth.generateGuestToken();
      const token2 = auth.generateGuestToken();
      
      const decoded1 = auth.verifyToken(token1);
      const decoded2 = auth.verifyToken(token2);

      expect(decoded1.playerId).not.toBe(decoded2.playerId);
    });

    it('should start guest IDs with "guest_" prefix', () => {
      const token = auth.generateGuestToken();
      const decoded = auth.verifyToken(token);

      expect(decoded.playerId).toMatch(/^guest_/);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const ip = '192.168.1.1';
      const maxRequests = 5;
      const windowMs = 60000;

      // First requests should all pass
      for (let i = 0; i < maxRequests; i++) {
        const result = auth.checkRateLimit(ip, maxRequests, windowMs);
        expect(result).toBe(true);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const ip = '192.168.1.2';
      const maxRequests = 3;
      const windowMs = 60000;

      // First 3 should pass
      for (let i = 0; i < maxRequests; i++) {
        expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(true);
      }

      // 4th should fail
      expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(false);
    });

    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.3';
      const ip2 = '192.168.1.4';
      const maxRequests = 2;
      const windowMs = 60000;

      // Both IPs should be able to make requests
      expect(auth.checkRateLimit(ip1, maxRequests, windowMs)).toBe(true);
      expect(auth.checkRateLimit(ip1, maxRequests, windowMs)).toBe(true);
      expect(auth.checkRateLimit(ip2, maxRequests, windowMs)).toBe(true);
      expect(auth.checkRateLimit(ip2, maxRequests, windowMs)).toBe(true);

      // Both IPs should now be at limit
      expect(auth.checkRateLimit(ip1, maxRequests, windowMs)).toBe(false);
      expect(auth.checkRateLimit(ip2, maxRequests, windowMs)).toBe(false);
    });

    it('should use default values when not specified', () => {
      const ip = '192.168.1.5';

      // Should not throw with default parameters
      expect(() => {
        auth.checkRateLimit(ip);
      }).not.toThrow();
    });

    it('should reset after time window expires', () => {
      const ip = '192.168.1.6';
      const maxRequests = 2;
      const windowMs = 100; // Very short window for testing

      // Hit the limit
      expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(true);
      expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(true);
      expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(false);

      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Should be able to make requests again
          expect(auth.checkRateLimit(ip, maxRequests, windowMs)).toBe(true);
          resolve();
        }, windowMs + 10);
      });
    });
  });

  describe('token expiry', () => {
    it('should have expiration set in token', () => {
      const playerId = 'expiryTest';
      const token = auth.generateToken(playerId);
      const decoded = auth.verifyToken(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat / 1000); // exp is in seconds
    });
  });
});

describe('module exports', () => {
  it('should export authSystem singleton', () => {
    expect(authSystem).toBeDefined();
    expect(authSystem).toBeInstanceOf(AuthSystem);
  });

  it('should export generateTestToken function', () => {
    expect(generateTestToken).toBeDefined();
    expect(typeof generateTestToken).toBe('function');
  });

  it('generateTestToken should return valid token', () => {
    const token = generateTestToken();
    const auth = new AuthSystem();
    const decoded = auth.verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded.playerId).toBeDefined();
  });
});
