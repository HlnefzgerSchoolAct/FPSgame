/**
 * Room - Authoritative game room with simulation state
 * Manages players, tick loop, snapshot generation
 */

import { movementSystem } from '../systems/Movement.js';
import { combatSystem } from '../systems/Combat.js';
import { spawnSystem } from '../systems/Spawn.js';
import { MatchSystem } from '../systems/Match.js';
import { antiCheatSystem } from '../antiCheat/Detectors.js';
import { 
  createSnapshotMessage, 
  createEventMessage, 
  createReconcileMessage,
  EventType 
} from '../protocol/Schema.js';

export class Room {
  constructor(roomId, config = {}) {
    this.id = roomId;
    this.config = {
      maxPlayers: config.maxPlayers || 12,
      gameMode: config.gameMode || 'tdm',
      map: config.map || 'arena_hub',
      tickRate: config.tickRate || 30,
      snapshotRate: config.snapshotRate || 20,
      ...config
    };
    
    this.players = new Map(); // playerId -> player data
    this.connections = new Map(); // playerId -> WebSocket
    this.tickCount = 0;
    this.lastTickTime = Date.now();
    this.lastSnapshotTime = Date.now();
    
    // Game systems
    this.matchSystem = new MatchSystem(this.config.gameMode, {
      timeLimit: config.timeLimit || 600,
      scoreLimit: config.scoreLimit || 50,
    });
    
    // Initialize spawn points
    spawnSystem.createDefaultSpawnPoints(this.config.map);
    
    // Tick interval
    this.tickInterval = 1000 / this.config.tickRate;
    this.snapshotInterval = 1000 / this.config.snapshotRate;
    this.tickTimer = null;
    
    console.log(`Room ${this.id} created: ${this.config.gameMode} on ${this.config.map}`);
  }
  
  /**
   * Add player to room
   */
  addPlayer(playerId, connection, playerData) {
    if (this.players.size >= this.config.maxPlayers) {
      return { success: false, error: 'Room full' };
    }
    
    // Assign team
    const team = this.assignTeam();
    
    // Get spawn position
    const spawn = spawnSystem.getSafeSpawn(
      this.config.map,
      team,
      this.getEnemyPositions(team),
      this.getTeamPositions(team)
    );
    
    // Initialize player
    const player = {
      id: playerId,
      username: playerData.username || `Player${playerId}`,
      team,
      health: 100,
      maxHealth: 100,
      alive: true,
      spawnPoint: spawn,
      loadout: playerData.loadout || this.getDefaultLoadout(),
      stats: {
        kills: 0,
        deaths: 0,
        damage: 0,
      },
      joinedAt: Date.now(),
    };
    
    this.players.set(playerId, player);
    this.connections.set(playerId, connection);
    
    // Initialize systems
    movementSystem.initPlayer(playerId, spawn.position);
    antiCheatSystem.initPlayer(playerId);
    
    // Update match teams
    this.updateMatchTeams();
    
    console.log(`Player ${playerId} joined room ${this.id} (${this.players.size}/${this.config.maxPlayers})`);
    
    // Start match if needed
    if (this.matchSystem.state === 'waiting' && this.players.size >= 2) {
      this.startMatch();
    }
    
    return { success: true, player, spawn };
  }
  
  /**
   * Remove player from room
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    this.players.delete(playerId);
    this.connections.delete(playerId);
    
    movementSystem.removePlayer(playerId);
    antiCheatSystem.removePlayer(playerId);
    combatSystem.clearHistory(playerId);
    
    console.log(`Player ${playerId} left room ${this.id}`);
    
    // End match if not enough players
    if (this.players.size < 2 && this.matchSystem.state === 'active') {
      this.matchSystem.state = 'ended';
    }
    
    this.updateMatchTeams();
  }
  
  /**
   * Assign team to new player
   */
  assignTeam() {
    if (this.config.gameMode === 'ffa') {
      return 'ffa';
    }
    
    // Balance teams
    const teamCounts = { team_a: 0, team_b: 0 };
    for (const player of this.players.values()) {
      if (player.team in teamCounts) {
        teamCounts[player.team]++;
      }
    }
    
    return teamCounts.team_a <= teamCounts.team_b ? 'team_a' : 'team_b';
  }
  
  /**
   * Update match system with current teams
   */
  updateMatchTeams() {
    const teams = new Map();
    for (const [playerId, player] of this.players) {
      teams.set(playerId, player.team);
    }
    this.matchSystem.setPlayerTeams(teams);
  }
  
  /**
   * Start the match
   */
  startMatch() {
    this.matchSystem.start();
    this.startTick();
    
    // Notify all players
    this.broadcast(createEventMessage(EventType.SCORE, {
      message: 'Match started!',
      matchState: this.matchSystem.getMatchState(),
    }));
  }
  
  /**
   * Start tick loop
   */
  startTick() {
    if (this.tickTimer) return;
    
    this.tickTimer = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }
  
  /**
   * Stop tick loop
   */
  stopTick() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }
  
  /**
   * Main tick function
   */
  tick() {
    const now = Date.now();
    const deltaTime = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;
    this.tickCount++;
    
    // Update movement
    movementSystem.tick(deltaTime);
    
    // Update combat (projectiles)
    combatSystem.updateProjectiles(deltaTime);
    
    // Update objectives
    if (this.matchSystem.gameMode === 'koth') {
      const positions = {};
      for (const [playerId, player] of this.players) {
        if (player.alive) {
          const state = movementSystem.getState(playerId);
          if (state) {
            positions[playerId] = state.position;
          }
        }
      }
      this.matchSystem.updateObjectives(positions);
    }
    
    // Record transforms for lag compensation
    for (const [playerId, player] of this.players) {
      if (player.alive) {
        const state = movementSystem.getState(playerId);
        if (state) {
          combatSystem.recordTransform(playerId, {
            position: state.position,
            rotation: state.rotation,
            bounds: { width: 0.6, height: 1.8, depth: 0.6 },
          });
        }
      }
    }
    
    // Send snapshots
    if (now - this.lastSnapshotTime >= this.snapshotInterval) {
      this.sendSnapshots();
      this.lastSnapshotTime = now;
    }
  }
  
  /**
   * Process player input
   */
  processInput(playerId, input) {
    const player = this.players.get(playerId);
    if (!player || !player.alive) return;
    
    // Anti-cheat validation
    const moveValidation = antiCheatSystem.validateMovement(
      playerId,
      input.move,
      input.dt
    );
    
    if (!moveValidation.valid) {
      if (moveValidation.ban) {
        this.kickPlayer(playerId, moveValidation.reason);
      }
      return;
    }
    
    const lookValidation = antiCheatSystem.validateLook(
      playerId,
      input.look,
      input.dt
    );
    
    if (!lookValidation.valid) {
      if (lookValidation.ban) {
        this.kickPlayer(playerId, lookValidation.reason);
      }
      return;
    }
    
    // Validate packet timing
    const packetValidation = antiCheatSystem.validatePacketTiming(
      playerId,
      input.seq,
      input.ts
    );
    
    if (!packetValidation.valid) {
      return; // Drop packet
    }
    
    // Process movement
    const newState = movementSystem.processInput(playerId, input);
    
    if (newState) {
      // Send reconciliation if needed
      // (in production, only send when significant correction is needed)
    }
  }
  
  /**
   * Process fire event
   */
  processFire(playerId, fireData) {
    const player = this.players.get(playerId);
    if (!player || !player.alive) return;
    
    // Get player state
    const state = movementSystem.getState(playerId);
    if (!state) return;
    
    // Anti-cheat: validate fire rate
    const fireValidation = antiCheatSystem.validateFireRate(
      playerId,
      fireData.weapon.weaponId,
      fireData.weapon.rpm || 600
    );
    
    if (!fireValidation.valid) {
      if (fireValidation.ban) {
        this.kickPlayer(playerId, fireValidation.reason);
      }
      return;
    }
    
    // Calculate fire origin and direction from player state
    const origin = {
      x: state.position.x,
      y: state.position.y + 1.6, // Eye height
      z: state.position.z,
    };
    
    const direction = {
      x: Math.sin(state.rotation.y) * Math.cos(state.rotation.x),
      y: Math.sin(state.rotation.x),
      z: Math.cos(state.rotation.y) * Math.cos(state.rotation.x),
    };
    
    // Get all entities for hit detection
    const entities = new Map();
    for (const [targetId, targetPlayer] of this.players) {
      if (targetPlayer.alive && targetId !== playerId) {
        entities.set(targetId, targetPlayer);
      }
    }
    
    // Process hit with lag compensation
    const hitResult = combatSystem.processFire(
      playerId,
      {
        origin,
        direction,
        weaponId: fireData.weapon.weaponId,
        spread: fireData.weapon.spread || 0,
      },
      fireData.ts,
      entities
    );
    
    if (hitResult.hit) {
      this.applyDamage(hitResult.targetId, hitResult.damage, playerId, fireData.weapon.weaponId);
      
      // Notify players
      this.broadcast(createEventMessage(EventType.HIT, {
        shooter: playerId,
        target: hitResult.targetId,
        damage: hitResult.damage,
        hitbox: hitResult.hitbox,
      }));
    }
  }
  
  /**
   * Apply damage to player
   */
  applyDamage(targetId, damage, attackerId, weaponId) {
    const target = this.players.get(targetId);
    if (!target || !target.alive) return;
    
    target.health -= damage;
    
    if (target.health <= 0) {
      target.health = 0;
      target.alive = false;
      
      // Register kill
      const killResult = this.matchSystem.registerKill(attackerId, targetId, weaponId);
      
      // Notify players
      this.broadcast(createEventMessage(EventType.KILL, {
        killer: attackerId,
        victim: targetId,
        weapon: weaponId,
        killerScore: killResult.killerScore,
      }));
      
      this.broadcast(createEventMessage(EventType.DEATH, {
        victim: targetId,
        killer: attackerId,
      }));
      
      // Respawn after delay
      setTimeout(() => {
        this.respawnPlayer(targetId);
      }, this.config.respawnDelay || 5000);
    }
  }
  
  /**
   * Respawn player
   */
  respawnPlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    const spawn = spawnSystem.getSafeSpawn(
      this.config.map,
      player.team,
      this.getEnemyPositions(player.team),
      this.getTeamPositions(player.team)
    );
    
    player.alive = true;
    player.health = player.maxHealth;
    player.spawnPoint = spawn;
    
    movementSystem.setPosition(playerId, spawn.position);
    
    console.log(`Player ${playerId} respawned`);
  }
  
  /**
   * Get enemy positions for spawn calculation
   */
  getEnemyPositions(team) {
    const positions = [];
    for (const player of this.players.values()) {
      if (player.team !== team && player.alive) {
        const state = movementSystem.getState(player.id);
        if (state) {
          positions.push(state.position);
        }
      }
    }
    return positions;
  }
  
  /**
   * Get team positions
   */
  getTeamPositions(team) {
    const positions = [];
    for (const player of this.players.values()) {
      if (player.team === team && player.alive) {
        const state = movementSystem.getState(player.id);
        if (state) {
          positions.push(state.position);
        }
      }
    }
    return positions;
  }
  
  /**
   * Send snapshots to all players
   */
  sendSnapshots() {
    // Build snapshot data
    const playersData = [];
    for (const [playerId, player] of this.players) {
      const state = movementSystem.getState(playerId);
      if (state) {
        playersData.push({
          id: playerId,
          team: player.team,
          health: player.health,
          alive: player.alive,
          pos: state.position,
          rot: state.rotation,
          vel: state.velocity,
          actions: {
            sprint: state.sprinting,
            crouch: state.crouched,
          },
        });
      }
    }
    
    const projectiles = combatSystem.getProjectiles();
    const objectives = this.matchSystem.getMatchState().objectives;
    
    // Send to each player
    for (const [playerId, connection] of this.connections) {
      const player = this.players.get(playerId);
      if (!player) continue;
      
      const yourState = playersData.find(p => p.id === playerId);
      const lastInputSeq = movementSystem.getState(playerId)?.lastInputSeq || 0;
      
      const snapshot = createSnapshotMessage(
        this.tickCount,
        playersData.filter(p => p.id !== playerId), // Don't send own state
        projectiles,
        objectives,
        yourState,
        lastInputSeq
      );
      
      if (connection.readyState === 1) { // WebSocket.OPEN
        connection.send(snapshot);
      }
    }
  }
  
  /**
   * Broadcast message to all players
   */
  broadcast(message, excludePlayer = null) {
    for (const [playerId, connection] of this.connections) {
      if (playerId === excludePlayer) continue;
      if (connection.readyState === 1) {
        connection.send(message);
      }
    }
  }
  
  /**
   * Send message to specific player
   */
  sendToPlayer(playerId, message) {
    const connection = this.connections.get(playerId);
    if (connection && connection.readyState === 1) {
      connection.send(message);
    }
  }
  
  /**
   * Kick player
   */
  kickPlayer(playerId, reason) {
    console.log(`Kicking player ${playerId}: ${reason}`);
    // TODO: Send kick message
    this.removePlayer(playerId);
  }
  
  /**
   * Get default loadout
   */
  getDefaultLoadout() {
    return {
      primary: 'ar_mk4',
      secondary: 'pistol_p9',
      equipment: ['frag', 'smoke'],
    };
  }
  
  /**
   * Check if room is empty
   */
  isEmpty() {
    return this.players.size === 0;
  }
  
  /**
   * Destroy room
   */
  destroy() {
    this.stopTick();
    
    for (const playerId of this.players.keys()) {
      this.removePlayer(playerId);
    }
    
    console.log(`Room ${this.id} destroyed`);
  }
}
