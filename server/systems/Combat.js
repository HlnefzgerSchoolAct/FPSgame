/**
 * Combat - Server-authoritative combat system with lag compensation
 * Handles hit registration with rewind to client timestamp
 */

export class CombatSystem {
  constructor() {
    this.hitHistory = new Map(); // playerId -> history of transforms
    this.historyDuration = 250; // ms - how long to keep history
    this.projectiles = new Map();
    this.projectileIdCounter = 0;
  }
  
  /**
   * Update entity transform in history
   */
  recordTransform(entityId, transform, timestamp = Date.now()) {
    if (!this.hitHistory.has(entityId)) {
      this.hitHistory.set(entityId, []);
    }
    
    const history = this.hitHistory.get(entityId);
    history.push({
      timestamp,
      position: { ...transform.position },
      rotation: { ...transform.rotation },
      bounds: { ...transform.bounds },
    });
    
    // Clean old history
    const cutoff = timestamp - this.historyDuration;
    while (history.length > 0 && history[0].timestamp < cutoff) {
      history.shift();
    }
  }
  
  /**
   * Get entity transform at a specific time (for lag compensation)
   */
  getTransformAtTime(entityId, timestamp) {
    const history = this.hitHistory.get(entityId);
    if (!history || history.length === 0) {
      return null;
    }
    
    // If timestamp is too old, return oldest available
    if (timestamp <= history[0].timestamp) {
      return history[0];
    }
    
    // If timestamp is too new, return newest available
    if (timestamp >= history[history.length - 1].timestamp) {
      return history[history.length - 1];
    }
    
    // Find the two transforms to interpolate between
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].timestamp <= timestamp && history[i + 1].timestamp >= timestamp) {
        const t0 = history[i];
        const t1 = history[i + 1];
        const alpha = (timestamp - t0.timestamp) / (t1.timestamp - t0.timestamp);
        
        // Linear interpolation
        return {
          timestamp,
          position: {
            x: t0.position.x + (t1.position.x - t0.position.x) * alpha,
            y: t0.position.y + (t1.position.y - t0.position.y) * alpha,
            z: t0.position.z + (t1.position.z - t0.position.z) * alpha,
          },
          rotation: {
            x: t0.rotation.x + (t1.rotation.x - t0.rotation.x) * alpha,
            y: t0.rotation.y + (t1.rotation.y - t0.rotation.y) * alpha,
            z: t0.rotation.z + (t1.rotation.z - t0.rotation.z) * alpha,
          },
          bounds: t0.bounds, // Use exact bounds (no interpolation)
        };
      }
    }
    
    return history[history.length - 1];
  }
  
  /**
   * Process a fire event with lag compensation
   */
  processFire(shooterId, fireData, clientTimestamp, entities) {
    const { origin, direction, weaponId, spread = 0 } = fireData;
    const serverTime = Date.now();
    
    // Validate fire rate
    const lastFireTime = this.lastFireTimes?.get(shooterId) || 0;
    const minInterval = this.getMinFireInterval(weaponId);
    
    if (serverTime - lastFireTime < minInterval) {
      return {
        hit: false,
        reason: 'Fire rate too high',
        reject: true
      };
    }
    
    if (!this.lastFireTimes) {
      this.lastFireTimes = new Map();
    }
    this.lastFireTimes.set(shooterId, serverTime);
    
    // Rewind to client timestamp for hit detection
    const rewindTime = Math.max(
      serverTime - this.historyDuration,
      clientTimestamp
    );
    
    // Get all entities at the rewind time
    const rewindedEntities = [];
    for (const [entityId, entity] of entities) {
      if (entityId === shooterId) continue; // Can't hit yourself
      
      const transform = this.getTransformAtTime(entityId, rewindTime);
      if (transform) {
        rewindedEntities.push({
          id: entityId,
          ...entity,
          transform
        });
      }
    }
    
    // Perform ray-cast hit detection
    const hitResult = this.rayCastHit(origin, direction, rewindedEntities, spread);
    
    if (hitResult.hit) {
      // Validate line of sight (simple check, can be enhanced)
      const losValid = this.validateLineOfSight(origin, hitResult.hitPosition);
      
      if (!losValid) {
        return {
          hit: false,
          reason: 'Line of sight blocked'
        };
      }
      
      // Calculate damage based on weapon and hit location
      const damage = this.calculateDamage(weaponId, hitResult.distance, hitResult.hitbox);
      
      return {
        hit: true,
        targetId: hitResult.entityId,
        hitPosition: hitResult.hitPosition,
        hitbox: hitResult.hitbox,
        damage,
        distance: hitResult.distance,
        rewindTime,
        latency: serverTime - clientTimestamp,
      };
    }
    
    return {
      hit: false,
      reason: 'Miss'
    };
  }
  
  /**
   * Ray-cast hit detection
   */
  rayCastHit(origin, direction, entities, spread) {
    // Apply spread
    const spreadRad = spread * Math.PI / 180;
    const spreadX = (Math.random() - 0.5) * spreadRad;
    const spreadY = (Math.random() - 0.5) * spreadRad;
    
    const dir = {
      x: direction.x + spreadX,
      y: direction.y + spreadY,
      z: direction.z,
    };
    
    // Normalize direction
    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    dir.x /= len;
    dir.y /= len;
    dir.z /= len;
    
    let closestHit = null;
    let closestDistance = Infinity;
    
    for (const entity of entities) {
      const hit = this.rayBoxIntersection(origin, dir, entity.transform);
      if (hit && hit.distance < closestDistance) {
        closestDistance = hit.distance;
        closestHit = {
          hit: true,
          entityId: entity.id,
          hitPosition: hit.position,
          hitbox: hit.hitbox,
          distance: hit.distance,
        };
      }
    }
    
    return closestHit || { hit: false };
  }
  
  /**
   * Ray-box intersection (simplified AABB)
   */
  rayBoxIntersection(origin, direction, transform) {
    const bounds = transform.bounds || { width: 0.6, height: 1.8, depth: 0.6 };
    const pos = transform.position;
    
    // Simple AABB check
    const halfWidth = bounds.width / 2;
    const halfDepth = bounds.depth / 2;
    
    const min = {
      x: pos.x - halfWidth,
      y: pos.y,
      z: pos.z - halfDepth,
    };
    
    const max = {
      x: pos.x + halfWidth,
      y: pos.y + bounds.height,
      z: pos.z + halfDepth,
    };
    
    // Ray-AABB intersection
    let tMin = 0;
    let tMax = 1000; // Max ray distance
    
    for (const axis of ['x', 'y', 'z']) {
      if (Math.abs(direction[axis]) < 0.0001) {
        if (origin[axis] < min[axis] || origin[axis] > max[axis]) {
          return null;
        }
      } else {
        const t1 = (min[axis] - origin[axis]) / direction[axis];
        const t2 = (max[axis] - origin[axis]) / direction[axis];
        
        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
        
        if (tMin > tMax) {
          return null;
        }
      }
    }
    
    if (tMin < 0) return null;
    
    // Calculate hit position
    const hitPosition = {
      x: origin.x + direction.x * tMin,
      y: origin.y + direction.y * tMin,
      z: origin.z + direction.z * tMin,
    };
    
    // Determine hitbox (head, body, legs)
    const relativeY = hitPosition.y - pos.y;
    let hitbox = 'body';
    
    if (relativeY > bounds.height * 0.85) {
      hitbox = 'head';
    } else if (relativeY < bounds.height * 0.4) {
      hitbox = 'legs';
    }
    
    return {
      position: hitPosition,
      distance: tMin,
      hitbox,
    };
  }
  
  /**
   * Validate line of sight (simplified - checks for obvious obstacles)
   */
  validateLineOfSight(origin, target) {
    // TODO: Implement proper map geometry check
    // For now, just validate distance
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance < 200; // Max valid shot distance
  }
  
  /**
   * Calculate damage based on weapon, distance, and hitbox
   */
  calculateDamage(weaponId, distance, hitbox) {
    // Base damage by weapon type (simplified)
    const baseDamage = {
      ar_mk4: 25,
      smg_phantom: 20,
      shotgun_enforcer: 80,
      sniper_longshot: 90,
      pistol_p9: 30,
    };
    
    let damage = baseDamage[weaponId] || 25;
    
    // Hitbox multipliers
    const hitboxMultipliers = {
      head: 2.0,
      body: 1.0,
      legs: 0.8,
    };
    
    damage *= hitboxMultipliers[hitbox] || 1.0;
    
    // Distance falloff (starts at 20m)
    if (distance > 20) {
      const falloff = Math.max(0.5, 1 - (distance - 20) / 100);
      damage *= falloff;
    }
    
    return Math.round(damage);
  }
  
  /**
   * Get minimum fire interval for weapon (based on RPM)
   */
  getMinFireInterval(weaponId) {
    const rpm = {
      ar_mk4: 650,
      smg_phantom: 900,
      shotgun_enforcer: 80,
      sniper_longshot: 60,
      pistol_p9: 400,
    };
    
    const weaponRPM = rpm[weaponId] || 600;
    return (60000 / weaponRPM) * 0.9; // 10% tolerance
  }
  
  /**
   * Create a projectile (for grenades, rockets, etc.)
   */
  createProjectile(type, position, velocity, ownerId) {
    const id = `proj_${this.projectileIdCounter++}`;
    
    this.projectiles.set(id, {
      id,
      type,
      position: { ...position },
      velocity: { ...velocity },
      ownerId,
      createdAt: Date.now(),
    });
    
    return id;
  }
  
  /**
   * Update projectiles
   */
  updateProjectiles(deltaTime) {
    const gravity = -9.8;
    const now = Date.now();
    const toRemove = [];
    
    for (const [id, projectile] of this.projectiles) {
      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.position.z += projectile.velocity.z * deltaTime;
      
      // Apply gravity
      projectile.velocity.y += gravity * deltaTime;
      
      // Check for ground collision
      if (projectile.position.y <= 0) {
        toRemove.push(id);
      }
      
      // Remove old projectiles (10 second lifetime)
      if (now - projectile.createdAt > 10000) {
        toRemove.push(id);
      }
    }
    
    // Remove expired projectiles
    for (const id of toRemove) {
      this.projectiles.delete(id);
    }
  }
  
  /**
   * Get all projectiles (for snapshot)
   */
  getProjectiles() {
    return Array.from(this.projectiles.values());
  }
  
  /**
   * Clear history for entity
   */
  clearHistory(entityId) {
    this.hitHistory.delete(entityId);
  }
}

// Singleton instance
export const combatSystem = new CombatSystem();
