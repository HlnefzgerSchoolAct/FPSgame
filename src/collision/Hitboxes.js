/**
 * Hitboxes - Standard capsule + head hitbox definitions
 */
export class Hitboxes {
  constructor() {
    // Standard player hitbox dimensions
    this.capsule = {
      radius: 0.4,
      standHeight: 1.8,
      crouchHeight: 1.2
    };
    
    // Head hitbox (sphere)
    this.head = {
      radius: 0.15,
      offsetY: 0.15 // Offset from top of capsule
    };
    
    // Body zones with damage multipliers
    this.zones = {
      head: { multiplier: 2.0, priority: 1 },
      chest: { multiplier: 1.0, priority: 2 },
      stomach: { multiplier: 0.95, priority: 3 },
      limbs: { multiplier: 0.8, priority: 4 }
    };
  }
  
  /**
   * Check if a ray hits any hitbox
   * @param {Object} rayOrigin - {x, y, z}
   * @param {Object} rayDir - {x, y, z} normalized
   * @param {Object} targetPos - {x, y, z} target position
   * @param {Number} targetHeight - Current height (standing/crouching)
   * @param {Number} maxDistance - Maximum ray distance
   * @returns {Object|null} Hit info with zone and distance
   */
  raycast(rayOrigin, rayDir, targetPos, targetHeight, maxDistance = 1000) {
    // First check head hitbox (highest priority)
    const headHit = this._checkSphereIntersection(
      rayOrigin,
      rayDir,
      {
        x: targetPos.x,
        y: targetPos.y + targetHeight - this.head.offsetY,
        z: targetPos.z
      },
      this.head.radius,
      maxDistance
    );
    
    if (headHit) {
      return {
        hit: true,
        distance: headHit.distance,
        point: headHit.point,
        zone: 'head',
        multiplier: this.zones.head.multiplier
      };
    }
    
    // Check body capsule
    const bodyHit = this._checkCapsuleIntersection(
      rayOrigin,
      rayDir,
      targetPos,
      targetHeight,
      this.capsule.radius,
      maxDistance
    );
    
    if (bodyHit) {
      // Determine body zone based on height
      const relativeHeight = (bodyHit.point.y - targetPos.y) / targetHeight;
      let zone = 'chest';
      
      if (relativeHeight > 0.7) {
        zone = 'chest';
      } else if (relativeHeight > 0.4) {
        zone = 'stomach';
      } else {
        zone = 'limbs';
      }
      
      return {
        hit: true,
        distance: bodyHit.distance,
        point: bodyHit.point,
        zone,
        multiplier: this.zones[zone].multiplier
      };
    }
    
    return null;
  }
  
  _checkSphereIntersection(rayOrigin, rayDir, sphereCenter, radius, maxDistance) {
    // Vector from ray origin to sphere center
    const oc = {
      x: rayOrigin.x - sphereCenter.x,
      y: rayOrigin.y - sphereCenter.y,
      z: rayOrigin.z - sphereCenter.z
    };
    
    const a = rayDir.x * rayDir.x + rayDir.y * rayDir.y + rayDir.z * rayDir.z;
    const b = 2.0 * (oc.x * rayDir.x + oc.y * rayDir.y + oc.z * rayDir.z);
    const c = oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return null;
    
    const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
    
    if (t < 0 || t > maxDistance) return null;
    
    return {
      distance: t,
      point: {
        x: rayOrigin.x + rayDir.x * t,
        y: rayOrigin.y + rayDir.y * t,
        z: rayOrigin.z + rayDir.z * t
      }
    };
  }
  
  _checkCapsuleIntersection(rayOrigin, rayDir, capsuleBase, height, radius, maxDistance) {
    // Simplified capsule as cylinder + two spheres (top and bottom)
    // For simplicity, treat as a cylinder
    
    const capsuleTop = {
      x: capsuleBase.x,
      y: capsuleBase.y + height,
      z: capsuleBase.z
    };
    
    // Project ray onto XZ plane for cylinder intersection
    const rayStart2D = { x: rayOrigin.x, z: rayOrigin.z };
    const rayDir2D = { x: rayDir.x, z: rayDir.z };
    const capsuleCenter2D = { x: capsuleBase.x, z: capsuleBase.z };
    
    // Distance from ray to capsule axis in 2D
    const a = rayDir2D.x * rayDir2D.x + rayDir2D.z * rayDir2D.z;
    const b = 2.0 * ((rayStart2D.x - capsuleCenter2D.x) * rayDir2D.x + 
                     (rayStart2D.z - capsuleCenter2D.z) * rayDir2D.z);
    const c = (rayStart2D.x - capsuleCenter2D.x) * (rayStart2D.x - capsuleCenter2D.x) +
              (rayStart2D.z - capsuleCenter2D.z) * (rayStart2D.z - capsuleCenter2D.z) -
              radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return null;
    
    const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
    
    if (t < 0 || t > maxDistance) return null;
    
    // Check if hit point is within cylinder height
    const hitY = rayOrigin.y + rayDir.y * t;
    
    if (hitY < capsuleBase.y || hitY > capsuleBase.y + height) {
      return null;
    }
    
    return {
      distance: t,
      point: {
        x: rayOrigin.x + rayDir.x * t,
        y: hitY,
        z: rayOrigin.z + rayDir.z * t
      }
    };
  }
  
  getHitboxBounds(position, height) {
    return {
      min: {
        x: position.x - this.capsule.radius,
        y: position.y,
        z: position.z - this.capsule.radius
      },
      max: {
        x: position.x + this.capsule.radius,
        y: position.y + height,
        z: position.z + this.capsule.radius
      }
    };
  }
}
