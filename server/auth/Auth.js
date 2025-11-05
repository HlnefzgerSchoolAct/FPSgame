/**
 * Auth - Authentication and authorization system
 * JWT token-based authentication (stub for now, ready for real implementation)
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { playerDataStore } from '../persistence/PlayerData.js';

// Secret key for JWT (should be in environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

export class AuthSystem {
  constructor() {
    this.rateLimits = new Map(); // IP -> { count, resetTime }
  }
  
  /**
   * Generate a session token for a player
   * @param {string} playerId - Player identifier
   * @param {Object} metadata - Additional metadata to include in token
   * @returns {string} - JWT token
   */
  generateToken(playerId, metadata = {}) {
    const payload = {
      playerId,
      iat: Date.now(),
      ...metadata
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  }
  
  /**
   * Verify and decode a session token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} - Decoded token payload or null if invalid
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }
  
  /**
   * Authenticate a connection
   * @param {string} token - Session token
   * @returns {Object|null} - Authentication result with playerId
   */
  authenticate(token) {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }
    
    const decoded = this.verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Create or update session in player data store
    const playerId = decoded.playerId;
    playerDataStore.createSession(playerId, token);
    
    return {
      success: true,
      playerId,
      metadata: decoded
    };
  }
  
  /**
   * Generate a guest token for unauthenticated play
   * @returns {string} - Guest session token
   */
  generateGuestToken() {
    const guestId = `guest_${crypto.randomBytes(8).toString('hex')}`;
    return this.generateToken(guestId, { guest: true });
  }
  
  /**
   * Check rate limit for IP address
   * @param {string} ip - IP address
   * @param {number} maxRequests - Maximum requests per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if within rate limit
   */
  checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const limit = this.rateLimits.get(ip);
    
    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (limit.count >= maxRequests) {
      return false;
    }
    
    limit.count++;
    return true;
  }
  
  /**
   * Clean up expired rate limits
   */
  cleanupRateLimits() {
    const now = Date.now();
    for (const [ip, limit] of this.rateLimits.entries()) {
      if (now > limit.resetTime) {
        this.rateLimits.delete(ip);
      }
    }
  }
  
  /**
   * Ban check (stub for future implementation)
   * @param {string} playerId - Player ID to check
   * @returns {boolean} - True if player is banned
   */
  isBanned(playerId) {
    // TODO: Implement ban system with database
    return false;
  }
  
  /**
   * Get player permissions (stub for future implementation)
   * @param {string} playerId - Player ID
   * @returns {Object} - Player permissions
   */
  getPermissions(playerId) {
    // TODO: Implement role-based permissions
    return {
      canPlay: true,
      canChat: true,
      isAdmin: false,
      isModerator: false,
    };
  }
}

// Singleton instance
export const authSystem = new AuthSystem();

// For testing: generate a test token
export function generateTestToken(playerId = 'test_player_001') {
  return authSystem.generateToken(playerId, { test: true });
}
