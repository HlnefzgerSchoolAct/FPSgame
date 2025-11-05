/**
 * Spawn - Safe spawn point selection system
 * Follows design docs for spawn safety and validation
 */

export class SpawnSystem {
  constructor() {
    this.spawnPoints = new Map(); // mapId -> spawn points
    this.lastSpawnTimes = new Map(); // spawnId -> timestamp
    this.spawnCooldown = 3000; // ms - minimum time before reusing spawn
  }
  
  /**
   * Register spawn points for a map
   */
  registerSpawnPoints(mapId, spawnPoints) {
    this.spawnPoints.set(mapId, spawnPoints);
    console.log(`Registered ${spawnPoints.length} spawn points for map ${mapId}`);
  }
  
  /**
   * Get a safe spawn point
   */
  getSafeSpawn(mapId, team, enemyPositions, teamPositions) {
    const allSpawns = this.spawnPoints.get(mapId);
    if (!allSpawns || allSpawns.length === 0) {
      // Fallback to default spawn
      return this.getDefaultSpawn(team);
    }
    
    // Filter spawns for this team
    const teamSpawns = allSpawns.filter(spawn => 
      spawn.team === team || spawn.team === 'neutral'
    );
    
    if (teamSpawns.length === 0) {
      return this.getDefaultSpawn(team);
    }
    
    // Score each spawn point
    const scoredSpawns = teamSpawns.map(spawn => ({
      spawn,
      score: this.scoreSpawnPoint(spawn, enemyPositions, teamPositions)
    }));
    
    // Sort by score (higher is better)
    scoredSpawns.sort((a, b) => b.score - a.score);
    
    // Select from top candidates (some randomization)
    const topCandidates = scoredSpawns.slice(0, Math.min(3, scoredSpawns.length));
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    // Record spawn usage
    this.lastSpawnTimes.set(selected.spawn.id, Date.now());
    
    return selected.spawn;
  }
  
  /**
   * Score a spawn point based on safety criteria
   */
  scoreSpawnPoint(spawn, enemyPositions, teamPositions) {
    let score = 100;
    const now = Date.now();
    
    // Penalty for recently used spawns
    const lastUsed = this.lastSpawnTimes.get(spawn.id);
    if (lastUsed) {
      const timeSince = now - lastUsed;
      if (timeSince < this.spawnCooldown) {
        score -= 50 * (1 - timeSince / this.spawnCooldown);
      }
    }
    
    // Check enemy proximity (most important factor)
    let minEnemyDistance = Infinity;
    for (const enemyPos of enemyPositions) {
      const distance = this.distance(spawn.position, enemyPos);
      minEnemyDistance = Math.min(minEnemyDistance, distance);
      
      // Heavy penalty for enemies very close
      if (distance < 5) {
        score -= 100;
      } else if (distance < 10) {
        score -= 50;
      } else if (distance < 20) {
        score -= 20;
      }
      
      // Check if enemy has line of sight to spawn
      if (distance < 30 && this.hasLineOfSight(spawn.position, enemyPos)) {
        score -= 30;
      }
    }
    
    // Slight bonus for being near teammates (but not too close)
    for (const teamPos of teamPositions) {
      const distance = this.distance(spawn.position, teamPos);
      if (distance > 5 && distance < 20) {
        score += 5;
      } else if (distance < 3) {
        score -= 10; // Don't spawn on top of teammates
      }
    }
    
    // Bonus for spawns that haven't been used recently
    if (!lastUsed || (now - lastUsed) > this.spawnCooldown * 2) {
      score += 20;
    }
    
    // Use spawn priority if defined
    if (spawn.priority) {
      score += spawn.priority * 10;
    }
    
    return score;
  }
  
  /**
   * Check if there's line of sight between two positions
   */
  hasLineOfSight(pos1, pos2) {
    // Simplified LOS check
    // TODO: Implement proper raycasting against map geometry
    
    const distance = this.distance(pos1, pos2);
    const heightDiff = Math.abs(pos1.y - pos2.y);
    
    // If height difference is too large, probably no LOS
    if (heightDiff > 5 && distance < 20) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Calculate distance between two positions
   */
  distance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Get default spawn for team (fallback)
   */
  getDefaultSpawn(team) {
    const teamOffsets = {
      'team_a': { x: -20, y: 0, z: 0 },
      'team_b': { x: 20, y: 0, z: 0 },
      'ffa': { x: 0, y: 0, z: 0 },
    };
    
    const offset = teamOffsets[team] || { x: 0, y: 0, z: 0 };
    
    return {
      id: 'default',
      position: { ...offset },
      rotation: { x: 0, y: 0, z: 0 },
      team,
    };
  }
  
  /**
   * Create default spawn points for a map (for testing)
   */
  createDefaultSpawnPoints(mapId) {
    const spawns = [];
    
    // Team A spawns
    for (let i = 0; i < 5; i++) {
      spawns.push({
        id: `team_a_spawn_${i}`,
        position: {
          x: -25 + Math.random() * 10,
          y: 0,
          z: -10 + i * 5,
        },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        team: 'team_a',
        priority: 1,
      });
    }
    
    // Team B spawns
    for (let i = 0; i < 5; i++) {
      spawns.push({
        id: `team_b_spawn_${i}`,
        position: {
          x: 25 + Math.random() * 10,
          y: 0,
          z: -10 + i * 5,
        },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        team: 'team_b',
        priority: 1,
      });
    }
    
    // Neutral spawns (for FFA)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      spawns.push({
        id: `neutral_spawn_${i}`,
        position: {
          x: Math.cos(angle) * 30,
          y: 0,
          z: Math.sin(angle) * 30,
        },
        rotation: { x: 0, y: angle + Math.PI, z: 0 },
        team: 'neutral',
        priority: 1,
      });
    }
    
    this.registerSpawnPoints(mapId, spawns);
    return spawns;
  }
  
  /**
   * Validate spawn point is safe
   */
  validateSpawn(position, enemyPositions, minDistance = 10) {
    for (const enemyPos of enemyPositions) {
      if (this.distance(position, enemyPos) < minDistance) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Clear spawn cooldowns (for match reset)
   */
  clearCooldowns() {
    this.lastSpawnTimes.clear();
  }
}

// Singleton instance
export const spawnSystem = new SpawnSystem();
