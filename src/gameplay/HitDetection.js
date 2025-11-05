/**
 * HitDetection - Raycast-based hit detection with headshot/limb zones
 */
import { Hitboxes } from '../collision/Hitboxes.js';

export class HitDetection {
  constructor() {
    this.hitboxes = new Hitboxes();
    this.layers = {
      player: 1 << 0,
      environment: 1 << 1,
      prop: 1 << 2
    };
  }
  
  /**
   * Perform hitscan raycast
   * @param {Object} origin - Ray origin {x, y, z}
   * @param {Object} direction - Ray direction {x, y, z} (normalized)
   * @param {Number} spread - Spread angle in degrees
   * @param {Array} targets - Array of target objects with position and state
   * @param {Number} maxDistance - Maximum ray distance
   * @param {Number} layerMask - Layer mask for filtering
   * @returns {Object|null} Hit result
   */
  hitscan(origin, direction, spread, targets, maxDistance = 1000, layerMask = this.layers.player) {
    // Apply spread to direction
    const spreadDirection = this._applySpread(direction, spread);
    
    let closestHit = null;
    let closestDistance = maxDistance;
    
    // Check against all targets
    for (const target of targets) {
      if (!target.position || !target.state) continue;
      
      // Check layer
      if (!(target.layer & layerMask)) continue;
      
      const hit = this.hitboxes.raycast(
        origin,
        spreadDirection,
        target.position,
        target.state.height || 1.8,
        closestDistance
      );
      
      if (hit && hit.distance < closestDistance) {
        closestDistance = hit.distance;
        closestHit = {
          ...hit,
          target: target,
          targetId: target.id
        };
      }
    }
    
    return closestHit;
  }
  
  /**
   * Check line of sight between two points
   * @param {Object} from - Start position {x, y, z}
   * @param {Object} to - End position {x, y, z}
   * @param {Array} obstacles - Array of obstacle objects
   * @returns {Boolean} True if line of sight is clear
   */
  hasLineOfSight(from, to, obstacles = []) {
    const direction = {
      x: to.x - from.x,
      y: to.y - from.y,
      z: to.z - from.z
    };
    
    const distance = Math.sqrt(
      direction.x * direction.x +
      direction.y * direction.y +
      direction.z * direction.z
    );
    
    if (distance === 0) return true;
    
    // Normalize direction
    direction.x /= distance;
    direction.y /= distance;
    direction.z /= distance;
    
    // Check for obstacles
    for (const obstacle of obstacles) {
      // Simple sphere collision check for obstacles
      if (this._rayIntersectsSphere(from, direction, obstacle.position, obstacle.radius, distance)) {
        return false;
      }
    }
    
    return true;
  }
  
  _applySpread(direction, spreadDegrees) {
    if (spreadDegrees === 0) return direction;
    
    const spreadRadians = spreadDegrees * Math.PI / 180;
    
    // Random angle in cone
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * spreadRadians;
    
    // Convert to cartesian offset
    const spreadX = Math.sin(phi) * Math.cos(theta);
    const spreadY = Math.sin(phi) * Math.sin(theta);
    const spreadZ = Math.cos(phi);
    
    // Create perpendicular vectors
    const up = Math.abs(direction.y) < 0.999 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    
    // Right vector
    const right = this._cross(direction, up);
    this._normalize(right);
    
    // Up vector (recomputed)
    const actualUp = this._cross(right, direction);
    this._normalize(actualUp);
    
    // Apply spread
    return {
      x: direction.x * spreadZ + right.x * spreadX + actualUp.x * spreadY,
      y: direction.y * spreadZ + right.y * spreadX + actualUp.y * spreadY,
      z: direction.z * spreadZ + right.z * spreadX + actualUp.z * spreadY
    };
  }
  
  _cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }
  
  _normalize(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length > 0) {
      v.x /= length;
      v.y /= length;
      v.z /= length;
    }
  }
  
  _rayIntersectsSphere(rayOrigin, rayDir, sphereCenter, radius, maxDistance) {
    const oc = {
      x: rayOrigin.x - sphereCenter.x,
      y: rayOrigin.y - sphereCenter.y,
      z: rayOrigin.z - sphereCenter.z
    };
    
    const a = rayDir.x * rayDir.x + rayDir.y * rayDir.y + rayDir.z * rayDir.z;
    const b = 2.0 * (oc.x * rayDir.x + oc.y * rayDir.y + oc.z * rayDir.z);
    const c = oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return false;
    
    const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
    
    return t >= 0 && t <= maxDistance;
  }
  
  /**
   * Calculate damage with multipliers
   * @param {Number} baseDamage - Base weapon damage
   * @param {String} zone - Hit zone (head, chest, etc.)
   * @param {Number} distance - Distance to target
   * @param {Function} falloffFunc - Function to calculate damage falloff
   * @returns {Number} Final damage
   */
  calculateDamage(baseDamage, zone, distance, falloffFunc) {
    let damage = baseDamage;
    
    // Apply zone multiplier
    const zoneData = this.hitboxes.zones[zone];
    if (zoneData) {
      damage *= zoneData.multiplier;
    }
    
    // Apply distance falloff
    if (falloffFunc) {
      damage = falloffFunc(damage, distance);
    }
    
    return Math.round(damage);
  }
}
