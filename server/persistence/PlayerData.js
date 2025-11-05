/**
 * PlayerData - In-memory player data persistence
 * Provides interface for future database integration
 */

export class PlayerDataStore {
  constructor() {
    this.players = new Map();
    this.sessions = new Map();
  }
  
  /**
   * Get or create player data
   */
  getPlayer(playerId) {
    if (!this.players.has(playerId)) {
      this.players.set(playerId, this.createDefaultPlayerData(playerId));
    }
    return this.players.get(playerId);
  }
  
  /**
   * Create default player data structure
   */
  createDefaultPlayerData(playerId) {
    return {
      id: playerId,
      username: `Player${playerId}`,
      level: 1,
      xp: 0,
      currencies: {
        credits: 5000,
        gems: 100,
      },
      inventory: {
        weapons: ['ar_mk4', 'smg_phantom', 'shotgun_enforcer', 'pistol_p9'],
        skins: [],
        charms: [],
        operators: [],
        emotes: [],
      },
      loadouts: [
        {
          id: 0,
          name: 'Default',
          primary: 'ar_mk4',
          secondary: 'pistol_p9',
          equipment: ['frag', 'smoke'],
        }
      ],
      stats: {
        kills: 0,
        deaths: 0,
        wins: 0,
        losses: 0,
        matches: 0,
        playtimeSeconds: 0,
      },
      ranked: {
        mmr: 1000,
        rank: 'Silver I',
        wins: 0,
        losses: 0,
        placementMatches: 0,
      },
      createdAt: Date.now(),
      lastSeen: Date.now(),
    };
  }
  
  /**
   * Update player currencies
   */
  updateCurrencies(playerId, credits, gems) {
    const player = this.getPlayer(playerId);
    if (credits !== undefined) {
      player.currencies.credits = Math.max(0, player.currencies.credits + credits);
    }
    if (gems !== undefined) {
      player.currencies.gems = Math.max(0, player.currencies.gems + gems);
    }
    return player.currencies;
  }
  
  /**
   * Add item to player inventory
   */
  addToInventory(playerId, itemType, itemId) {
    const player = this.getPlayer(playerId);
    if (!player.inventory[itemType]) {
      player.inventory[itemType] = [];
    }
    if (!player.inventory[itemType].includes(itemId)) {
      player.inventory[itemType].push(itemId);
    }
    return player.inventory;
  }
  
  /**
   * Check if player owns item
   */
  ownsItem(playerId, itemType, itemId) {
    const player = this.getPlayer(playerId);
    return player.inventory[itemType]?.includes(itemId) || false;
  }
  
  /**
   * Update player stats
   */
  updateStats(playerId, stats) {
    const player = this.getPlayer(playerId);
    Object.assign(player.stats, stats);
    return player.stats;
  }
  
  /**
   * Update ranked data
   */
  updateRanked(playerId, rankedData) {
    const player = this.getPlayer(playerId);
    Object.assign(player.ranked, rankedData);
    return player.ranked;
  }
  
  /**
   * Create session for player
   */
  createSession(playerId, sessionToken) {
    this.sessions.set(sessionToken, {
      playerId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
    return sessionToken;
  }
  
  /**
   * Validate session token
   */
  validateSession(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (!session) return null;
    
    // Update last activity
    session.lastActivity = Date.now();
    return session.playerId;
  }
  
  /**
   * Remove session
   */
  removeSession(sessionToken) {
    this.sessions.delete(sessionToken);
  }
  
  /**
   * Update last seen timestamp
   */
  updateLastSeen(playerId) {
    const player = this.getPlayer(playerId);
    player.lastSeen = Date.now();
  }
  
  /**
   * Get player count
   */
  getPlayerCount() {
    return this.players.size;
  }
  
  /**
   * Get active session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
  
  /**
   * Clean up old sessions (call periodically)
   */
  cleanupSessions(maxAgeMs = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [token, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxAgeMs) {
        this.sessions.delete(token);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Singleton instance
export const playerDataStore = new PlayerDataStore();
