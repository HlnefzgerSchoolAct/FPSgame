/**
 * InterpolationBuffer - Smooth interpolation for remote entities
 * Buffers snapshots and interpolates between them for smooth rendering
 */

export class InterpolationBuffer {
  constructor(bufferTime = 100) {
    this.bufferTime = bufferTime; // ms to buffer
    this.snapshots = [];
    this.maxSnapshots = 30; // Keep last 30 snapshots (~1 second at 30Hz)
  }
  
  /**
   * Add snapshot to buffer
   */
  addSnapshot(snapshot, serverTime) {
    this.snapshots.push({
      data: snapshot,
      time: serverTime,
      receivedAt: Date.now(),
    });
    
    // Trim old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }
  
  /**
   * Get interpolated state for current time
   */
  getInterpolatedState(currentTime) {
    if (this.snapshots.length === 0) {
      return null;
    }
    
    // Calculate render time (buffered behind current time)
    const renderTime = currentTime - this.bufferTime;
    
    // Find two snapshots to interpolate between
    let from = null;
    let to = null;
    
    for (let i = 0; i < this.snapshots.length - 1; i++) {
      const current = this.snapshots[i];
      const next = this.snapshots[i + 1];
      
      if (current.time <= renderTime && next.time >= renderTime) {
        from = current;
        to = next;
        break;
      }
    }
    
    // If no bracket found, use most recent or oldest
    if (!from || !to) {
      if (this.snapshots.length === 1) {
        return this.snapshots[0].data;
      }
      
      // If render time is before all snapshots, use first
      if (renderTime < this.snapshots[0].time) {
        return this.snapshots[0].data;
      }
      
      // If render time is after all snapshots, use last
      return this.snapshots[this.snapshots.length - 1].data;
    }
    
    // Interpolate between snapshots
    const alpha = (renderTime - from.time) / (to.time - from.time);
    return this.interpolateSnapshots(from.data, to.data, alpha);
  }
  
  /**
   * Interpolate between two snapshots
   */
  interpolateSnapshots(from, to, alpha) {
    const interpolated = {
      players: [],
      projectiles: [],
      objectives: to.objectives || [], // Don't interpolate objectives
    };
    
    // Interpolate players
    if (from.players && to.players) {
      for (const toPlayer of to.players) {
        const fromPlayer = from.players.find(p => p.id === toPlayer.id);
        
        if (fromPlayer) {
          interpolated.players.push(this.interpolateEntity(fromPlayer, toPlayer, alpha));
        } else {
          // New player - just use their state
          interpolated.players.push({ ...toPlayer });
        }
      }
    }
    
    // Interpolate projectiles
    if (from.projectiles && to.projectiles) {
      for (const toProj of to.projectiles) {
        const fromProj = from.projectiles.find(p => p.id === toProj.id);
        
        if (fromProj) {
          interpolated.projectiles.push(this.interpolateEntity(fromProj, toProj, alpha));
        } else {
          interpolated.projectiles.push({ ...toProj });
        }
      }
    }
    
    return interpolated;
  }
  
  /**
   * Interpolate single entity
   */
  interpolateEntity(from, to, alpha) {
    const entity = {
      ...to,
      pos: {
        x: this.lerp(from.pos.x, to.pos.x, alpha),
        y: this.lerp(from.pos.y, to.pos.y, alpha),
        z: this.lerp(from.pos.z, to.pos.z, alpha),
      },
    };
    
    // Interpolate rotation if present
    if (from.rot && to.rot) {
      entity.rot = {
        x: this.lerpAngle(from.rot.x, to.rot.x, alpha),
        y: this.lerpAngle(from.rot.y, to.rot.y, alpha),
        z: this.lerpAngle(from.rot.z, to.rot.z, alpha),
      };
    }
    
    // Interpolate velocity if present
    if (from.vel && to.vel) {
      entity.vel = {
        x: this.lerp(from.vel.x, to.vel.x, alpha),
        y: this.lerp(from.vel.y, to.vel.y, alpha),
        z: this.lerp(from.vel.z, to.vel.z, alpha),
      };
    }
    
    return entity;
  }
  
  /**
   * Linear interpolation
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  /**
   * Angle interpolation (handles wrap-around)
   */
  lerpAngle(a, b, t) {
    // Find shortest path
    let diff = b - a;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    return a + diff * t;
  }
  
  /**
   * Set buffer time
   */
  setBufferTime(ms) {
    this.bufferTime = Math.max(0, ms);
  }
  
  /**
   * Get buffer time
   */
  getBufferTime() {
    return this.bufferTime;
  }
  
  /**
   * Get buffer health (how full is the buffer)
   */
  getBufferHealth() {
    if (this.snapshots.length < 2) return 0;
    
    const now = Date.now();
    const oldest = this.snapshots[0].receivedAt;
    const newest = this.snapshots[this.snapshots.length - 1].receivedAt;
    const actualBuffer = newest - oldest;
    
    return Math.min(1, actualBuffer / this.bufferTime);
  }
  
  /**
   * Clear buffer
   */
  clear() {
    this.snapshots = [];
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    if (this.snapshots.length === 0) {
      return {
        count: 0,
        bufferHealth: 0,
        oldestAge: 0,
        newestAge: 0,
      };
    }
    
    const now = Date.now();
    const oldest = this.snapshots[0];
    const newest = this.snapshots[this.snapshots.length - 1];
    
    return {
      count: this.snapshots.length,
      bufferHealth: this.getBufferHealth(),
      oldestAge: now - oldest.receivedAt,
      newestAge: now - newest.receivedAt,
      bufferTime: this.bufferTime,
    };
  }
}

export default InterpolationBuffer;
