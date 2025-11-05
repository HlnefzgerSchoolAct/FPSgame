/**
 * Detectors - Anti-cheat detection system
 * Monitors player behavior for suspicious activity
 */

export class AntiCheatSystem {
  constructor() {
    this.playerTracking = new Map();
    this.suspiciousEvents = [];
    this.banThresholds = {
      speedHack: 5,
      fireRateHack: 3,
      impossibleAngle: 3,
      teleport: 2,
    };
  }
  
  /**
   * Initialize tracking for a player
   */
  initPlayer(playerId) {
    this.playerTracking.set(playerId, {
      playerId,
      lastPosition: null,
      lastLook: null,
      lastFireTime: 0,
      fireIntervals: [],
      moveHistory: [],
      violations: {
        speedHack: 0,
        fireRateHack: 0,
        impossibleAngle: 0,
        teleport: 0,
      },
      startTime: Date.now(),
    });
  }
  
  /**
   * Remove player tracking
   */
  removePlayer(playerId) {
    this.playerTracking.delete(playerId);
  }
  
  /**
   * Validate movement input
   */
  validateMovement(playerId, position, deltaTime) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return { valid: true };
    
    if (tracking.lastPosition) {
      const dx = position.x - tracking.lastPosition.x;
      const dy = position.y - tracking.lastPosition.y;
      const dz = position.z - tracking.lastPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // Maximum possible speed (including sprint, jump, etc.)
      const maxSpeed = 15.0; // units per second
      const maxDistance = maxSpeed * deltaTime;
      
      if (distance > maxDistance * 1.5) { // 50% tolerance
        tracking.violations.speedHack++;
        this.logSuspiciousEvent({
          type: 'SPEED_HACK',
          playerId,
          distance,
          maxDistance,
          deltaTime,
          severity: 'HIGH',
        });
        
        if (tracking.violations.speedHack >= this.banThresholds.speedHack) {
          return { valid: false, reason: 'Speed hack detected', ban: true };
        }
        
        return { valid: false, reason: 'Suspicious speed' };
      }
      
      // Teleport detection
      if (distance > 50 && deltaTime < 0.5) {
        tracking.violations.teleport++;
        this.logSuspiciousEvent({
          type: 'TELEPORT',
          playerId,
          distance,
          deltaTime,
          severity: 'CRITICAL',
        });
        
        if (tracking.violations.teleport >= this.banThresholds.teleport) {
          return { valid: false, reason: 'Teleport detected', ban: true };
        }
      }
    }
    
    tracking.lastPosition = { ...position };
    tracking.moveHistory.push({
      position: { ...position },
      time: Date.now(),
    });
    
    // Keep only recent history (last 5 seconds)
    const cutoff = Date.now() - 5000;
    tracking.moveHistory = tracking.moveHistory.filter(h => h.time > cutoff);
    
    return { valid: true };
  }
  
  /**
   * Validate look/aim input
   */
  validateLook(playerId, look, deltaTime) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return { valid: true };
    
    if (tracking.lastLook) {
      const dx = Math.abs(look.x - tracking.lastLook.x);
      const dy = Math.abs(look.y - tracking.lastLook.y);
      
      // Maximum look speed (radians per second)
      const maxLookSpeed = Math.PI * 4; // 720 degrees per second
      const maxDelta = maxLookSpeed * deltaTime;
      
      if (dx > maxDelta * 2 || dy > maxDelta * 2) {
        tracking.violations.impossibleAngle++;
        this.logSuspiciousEvent({
          type: 'IMPOSSIBLE_ANGLE',
          playerId,
          deltaX: dx,
          deltaY: dy,
          maxDelta,
          deltaTime,
          severity: 'MEDIUM',
        });
        
        if (tracking.violations.impossibleAngle >= this.banThresholds.impossibleAngle) {
          return { valid: false, reason: 'Impossible aim speed', ban: true };
        }
        
        return { valid: false, reason: 'Suspicious aim speed' };
      }
    }
    
    tracking.lastLook = { ...look };
    return { valid: true };
  }
  
  /**
   * Validate fire rate
   */
  validateFireRate(playerId, weaponId, expectedRPM = 600) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return { valid: true };
    
    const now = Date.now();
    const minInterval = (60000 / expectedRPM) * 0.8; // 20% tolerance
    
    if (tracking.lastFireTime > 0) {
      const interval = now - tracking.lastFireTime;
      
      if (interval < minInterval) {
        tracking.violations.fireRateHack++;
        this.logSuspiciousEvent({
          type: 'FIRE_RATE_HACK',
          playerId,
          weaponId,
          interval,
          minInterval,
          expectedRPM,
          severity: 'HIGH',
        });
        
        if (tracking.violations.fireRateHack >= this.banThresholds.fireRateHack) {
          return { valid: false, reason: 'Fire rate hack detected', ban: true };
        }
        
        return { valid: false, reason: 'Fire rate too high' };
      }
      
      tracking.fireIntervals.push(interval);
      if (tracking.fireIntervals.length > 10) {
        tracking.fireIntervals.shift();
      }
    }
    
    tracking.lastFireTime = now;
    return { valid: true };
  }
  
  /**
   * Validate ammo count
   */
  validateAmmo(playerId, currentAmmo, maxAmmo, magazineSize) {
    if (currentAmmo > maxAmmo || currentAmmo > magazineSize * 2) {
      this.logSuspiciousEvent({
        type: 'INVALID_AMMO',
        playerId,
        currentAmmo,
        maxAmmo,
        magazineSize,
        severity: 'HIGH',
      });
      return { valid: false, reason: 'Invalid ammo count' };
    }
    return { valid: true };
  }
  
  /**
   * Check for packet manipulation
   */
  validatePacketTiming(playerId, sequence, timestamp) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return { valid: true };
    
    // Basic sequence validation
    if (tracking.lastSequence && sequence <= tracking.lastSequence) {
      this.logSuspiciousEvent({
        type: 'OUT_OF_ORDER_PACKET',
        playerId,
        sequence,
        lastSequence: tracking.lastSequence,
        severity: 'LOW',
      });
      return { valid: false, reason: 'Out of order packet' };
    }
    
    tracking.lastSequence = sequence;
    return { valid: true };
  }
  
  /**
   * Log suspicious event
   */
  logSuspiciousEvent(event) {
    event.timestamp = Date.now();
    this.suspiciousEvents.push(event);
    
    // Keep only recent events (last hour)
    const cutoff = Date.now() - 3600000;
    this.suspiciousEvents = this.suspiciousEvents.filter(e => e.timestamp > cutoff);
    
    // Log to console (in production, send to monitoring system)
    console.warn('[ANTI-CHEAT]', event.type, event);
    
    // TODO: Send to admin dashboard / monitoring system
  }
  
  /**
   * Get player violation summary
   */
  getViolationSummary(playerId) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return null;
    
    const totalViolations = Object.values(tracking.violations).reduce((a, b) => a + b, 0);
    const playtime = (Date.now() - tracking.startTime) / 1000;
    
    return {
      playerId,
      violations: tracking.violations,
      totalViolations,
      playtimeSeconds: playtime,
      violationsPerMinute: totalViolations / (playtime / 60),
      suspiciousScore: this.calculateSuspiciousScore(tracking),
    };
  }
  
  /**
   * Calculate suspicious score (0-100)
   */
  calculateSuspiciousScore(tracking) {
    let score = 0;
    
    score += tracking.violations.speedHack * 15;
    score += tracking.violations.fireRateHack * 20;
    score += tracking.violations.impossibleAngle * 10;
    score += tracking.violations.teleport * 30;
    
    return Math.min(100, score);
  }
  
  /**
   * Should player be banned?
   */
  shouldBan(playerId) {
    const tracking = this.playerTracking.get(playerId);
    if (!tracking) return false;
    
    for (const [violation, count] of Object.entries(tracking.violations)) {
      if (count >= this.banThresholds[violation]) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get recent suspicious events
   */
  getRecentEvents(limit = 50) {
    return this.suspiciousEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Get events for specific player
   */
  getPlayerEvents(playerId) {
    return this.suspiciousEvents
      .filter(e => e.playerId === playerId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Clear violations for player (for testing or after manual review)
   */
  clearViolations(playerId) {
    const tracking = this.playerTracking.get(playerId);
    if (tracking) {
      tracking.violations = {
        speedHack: 0,
        fireRateHack: 0,
        impossibleAngle: 0,
        teleport: 0,
      };
    }
  }
}

// Singleton instance
export const antiCheatSystem = new AntiCheatSystem();
