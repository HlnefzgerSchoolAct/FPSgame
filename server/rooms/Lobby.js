/**
 * Lobby - Matchmaking and queue system
 * Handles player queuing, MMR matching, team balancing
 */

import { Room } from './Room.js';

export class LobbySystem {
  constructor() {
    this.queues = new Map(); // region -> queue
    this.rooms = new Map(); // roomId -> Room
    this.playerRooms = new Map(); // playerId -> roomId
    this.roomIdCounter = 0;
    
    // Initialize queues for common regions
    this.initializeQueues();
  }
  
  /**
   * Initialize queues
   */
  initializeQueues() {
    const regions = ['na', 'eu', 'asia', 'auto'];
    for (const region of regions) {
      this.queues.set(region, {
        players: [],
        lastMatchTime: Date.now(),
      });
    }
  }
  
  /**
   * Add player to queue
   */
  queuePlayer(playerId, playerData, connection, region = 'auto') {
    // Check if already in a room
    if (this.playerRooms.has(playerId)) {
      return {
        success: false,
        error: 'Already in a room',
        roomId: this.playerRooms.get(playerId),
      };
    }
    
    // Get or create queue
    if (!this.queues.has(region)) {
      this.queues.set(region, { players: [], lastMatchTime: Date.now() });
    }
    
    const queue = this.queues.get(region);
    
    // Check if already in queue
    if (queue.players.find(p => p.playerId === playerId)) {
      return { success: false, error: 'Already in queue' };
    }
    
    // Add to queue
    queue.players.push({
      playerId,
      playerData,
      connection,
      mmr: playerData.ranked?.mmr || 1000,
      queueTime: Date.now(),
    });
    
    console.log(`Player ${playerId} queued for ${region} (MMR: ${playerData.ranked?.mmr || 1000})`);
    
    // Try to make a match
    this.tryMakeMatch(region);
    
    return { success: true, queuePosition: queue.players.length };
  }
  
  /**
   * Remove player from queue
   */
  dequeuePlayer(playerId) {
    for (const queue of this.queues.values()) {
      const index = queue.players.findIndex(p => p.playerId === playerId);
      if (index >= 0) {
        queue.players.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  
  /**
   * Try to create a match from queue
   */
  tryMakeMatch(region) {
    const queue = this.queues.get(region);
    if (!queue) return;
    
    // Need minimum players for a match
    const minPlayers = 4; // For testing; adjust based on game mode
    if (queue.players.length < minPlayers) return;
    
    // Sort by MMR
    queue.players.sort((a, b) => a.mmr - b.mmr);
    
    // Try to find balanced matches
    const matches = this.findBalancedMatches(queue.players, 12); // 6v6
    
    for (const match of matches) {
      this.createRoomForPlayers(match, region);
    }
  }
  
  /**
   * Find balanced matches from queue
   */
  findBalancedMatches(queuedPlayers, maxPlayersPerMatch) {
    const matches = [];
    const remaining = [...queuedPlayers];
    
    while (remaining.length >= 4) { // Minimum 4 players for a match
      const matchPlayers = [];
      const targetMMR = remaining[0].mmr;
      const now = Date.now();
      
      // Calculate MMR range based on wait time
      const maxWaitTime = Math.max(...remaining.map(p => now - p.queueTime));
      const mmrRange = this.calculateMMRRange(maxWaitTime);
      
      // Select players within MMR range
      for (let i = 0; i < remaining.length && matchPlayers.length < maxPlayersPerMatch; i++) {
        const player = remaining[i];
        const mmrDiff = Math.abs(player.mmr - targetMMR);
        
        if (mmrDiff <= mmrRange) {
          matchPlayers.push(player);
          remaining.splice(i, 1);
          i--;
        }
      }
      
      // Need at least 4 players
      if (matchPlayers.length >= 4) {
        matches.push(matchPlayers);
      } else {
        // Put players back in remaining
        remaining.push(...matchPlayers);
        break;
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate MMR range based on wait time
   */
  calculateMMRRange(waitTimeMs) {
    const waitTimeSec = waitTimeMs / 1000;
    
    if (waitTimeSec < 60) return 100; // 0-60s: ±100 MMR
    if (waitTimeSec < 120) return 150; // 60-120s: ±150 MMR
    if (waitTimeSec < 180) return 200; // 120-180s: ±200 MMR
    return 250; // 180s+: ±250 MMR
  }
  
  /**
   * Create room for matched players
   */
  createRoomForPlayers(players, region) {
    const roomId = `room_${this.roomIdCounter++}`;
    
    // Determine game mode based on player count
    let gameMode = 'tdm';
    if (players.length <= 8) {
      gameMode = 'tdm';
    } else if (players.length >= 10) {
      gameMode = 'koth';
    }
    
    // Create room
    const room = new Room(roomId, {
      maxPlayers: 12,
      gameMode,
      map: 'arena_hub',
      region,
    });
    
    this.rooms.set(roomId, room);
    
    // Balance teams
    const balanced = this.balanceTeams(players);
    
    // Add players to room
    for (const player of balanced) {
      const result = room.addPlayer(player.playerId, player.connection, player.playerData);
      
      if (result.success) {
        this.playerRooms.set(player.playerId, roomId);
        console.log(`Player ${player.playerId} joined room ${roomId}`);
      }
    }
    
    console.log(`Created room ${roomId} with ${players.length} players (${gameMode} on ${region})`);
    
    return room;
  }
  
  /**
   * Balance teams by MMR
   */
  balanceTeams(players) {
    // Sort by MMR descending
    const sorted = [...players].sort((a, b) => b.mmr - a.mmr);
    
    // Assign teams alternating (snake draft style)
    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) {
        sorted[i].assignedTeam = 'team_a';
      } else {
        sorted[i].assignedTeam = 'team_b';
      }
    }
    
    return sorted;
  }
  
  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
  
  /**
   * Get player's current room
   */
  getPlayerRoom(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : null;
  }
  
  /**
   * Remove player from room
   */
  removePlayerFromRoom(playerId) {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.removePlayer(playerId);
      
      // Clean up empty rooms
      if (room.isEmpty()) {
        room.destroy();
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} cleaned up (empty)`);
      }
    }
    
    this.playerRooms.delete(playerId);
  }
  
  /**
   * Get queue status
   */
  getQueueStatus(region = 'auto') {
    const queue = this.queues.get(region);
    if (!queue) return { players: 0, averageWait: 0 };
    
    const now = Date.now();
    const waitTimes = queue.players.map(p => now - p.queueTime);
    const averageWait = waitTimes.length > 0
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
      : 0;
    
    return {
      players: queue.players.length,
      averageWait: Math.round(averageWait / 1000), // seconds
    };
  }
  
  /**
   * Get lobby statistics
   */
  getStatistics() {
    let totalQueued = 0;
    let totalInGame = 0;
    
    for (const queue of this.queues.values()) {
      totalQueued += queue.players.length;
    }
    
    for (const room of this.rooms.values()) {
      totalInGame += room.players.size;
    }
    
    return {
      queued: totalQueued,
      inGame: totalInGame,
      totalRooms: this.rooms.size,
      queues: Array.from(this.queues.entries()).map(([region, queue]) => ({
        region,
        players: queue.players.length,
      })),
    };
  }
  
  /**
   * Cleanup abandoned rooms periodically
   */
  cleanupRooms() {
    const toDelete = [];
    
    for (const [roomId, room] of this.rooms) {
      if (room.isEmpty()) {
        room.destroy();
        toDelete.push(roomId);
      }
    }
    
    for (const roomId of toDelete) {
      this.rooms.delete(roomId);
    }
    
    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} empty rooms`);
    }
  }
  
  /**
   * Start periodic cleanup
   */
  startCleanup(intervalMs = 60000) {
    setInterval(() => {
      this.cleanupRooms();
    }, intervalMs);
  }
}

// Singleton instance
export const lobbySystem = new LobbySystem();
