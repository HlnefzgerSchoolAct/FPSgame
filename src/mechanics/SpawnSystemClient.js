/**
 * SpawnSystemClient - Client-side spawn hooks (visuals only, server authoritative)
 */
export class SpawnSystemClient {
  constructor() {
    this.spawnPoints = [];
    this.lastSpawnPosition = null;
    this.spawnProtectionTime = 3.0; // seconds
    this.timeSinceSpawn = 0;
    this.isSpawnProtected = false;
    
    // Spawn effects hooks (for graphics-agent)
    this.onSpawnEffects = null;
    this.onRespawnEffects = null;
  }
  
  /**
   * Register spawn points (from map data)
   * @param {Array} points - Array of {position, team, zone}
   */
  registerSpawnPoints(points) {
    this.spawnPoints = points;
    console.log(`Registered ${points.length} spawn points`);
  }
  
  /**
   * Handle spawn event from server
   * @param {Object} spawnData - {position, rotation, team}
   */
  onServerSpawn(spawnData) {
    this.lastSpawnPosition = spawnData.position;
    this.timeSinceSpawn = 0;
    this.isSpawnProtected = true;
    
    // Trigger spawn effects
    if (this.onSpawnEffects) {
      this.onSpawnEffects(spawnData);
    }
    
    // Emit event for other systems
    window.dispatchEvent(new CustomEvent('spawn:local', {
      detail: spawnData
    }));
    
    console.log('Spawned at:', spawnData.position);
  }
  
  /**
   * Handle respawn event
   * @param {Object} respawnData - {position, rotation}
   */
  onServerRespawn(respawnData) {
    this.lastSpawnPosition = respawnData.position;
    this.timeSinceSpawn = 0;
    this.isSpawnProtected = true;
    
    // Trigger respawn effects
    if (this.onRespawnEffects) {
      this.onRespawnEffects(respawnData);
    }
    
    // Emit event
    window.dispatchEvent(new CustomEvent('respawn:local', {
      detail: respawnData
    }));
    
    console.log('Respawned at:', respawnData.position);
  }
  
  /**
   * Update spawn protection timer
   * @param {Number} dt - Delta time
   */
  update(dt) {
    if (this.isSpawnProtected) {
      this.timeSinceSpawn += dt;
      
      if (this.timeSinceSpawn >= this.spawnProtectionTime) {
        this.isSpawnProtected = false;
        
        window.dispatchEvent(new CustomEvent('spawn:protection:end'));
        console.log('Spawn protection ended');
      }
    }
  }
  
  /**
   * Get nearest spawn point to a position (client prediction)
   * @param {Object} position - {x, y, z}
   * @param {String} team - Team filter
   * @returns {Object|null} Spawn point
   */
  getNearestSpawnPoint(position, team = null) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const point of this.spawnPoints) {
      if (team && point.team && point.team !== team) continue;
      
      const dx = point.position.x - position.x;
      const dy = point.position.y - position.y;
      const dz = point.position.z - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }
    
    return nearest;
  }
  
  /**
   * Check if player has spawn protection
   */
  hasSpawnProtection() {
    return this.isSpawnProtected;
  }
  
  /**
   * Get time remaining on spawn protection
   */
  getSpawnProtectionTimeRemaining() {
    if (!this.isSpawnProtected) return 0;
    return Math.max(0, this.spawnProtectionTime - this.timeSinceSpawn);
  }
  
  /**
   * Force end spawn protection (e.g., player fires weapon)
   */
  endSpawnProtection() {
    if (this.isSpawnProtected) {
      this.isSpawnProtected = false;
      window.dispatchEvent(new CustomEvent('spawn:protection:end'));
      console.log('Spawn protection manually ended');
    }
  }
}
