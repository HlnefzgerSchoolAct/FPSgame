/**
 * Match - Game mode rules, scoring, and match management
 * Supports TDM, FFA, King of the Hill, etc.
 */

export class MatchSystem {
  constructor(gameMode = 'tdm', config = {}) {
    this.gameMode = gameMode;
    this.config = this.getDefaultConfig(gameMode, config);
    this.state = 'waiting'; // waiting, active, ended
    this.startTime = null;
    this.endTime = null;
    this.scores = {};
    this.playerStats = new Map();
    this.objectives = [];
    this.roundNumber = 1;
    this.maxRounds = this.config.maxRounds || 1;
  }
  
  /**
   * Get default configuration for game mode
   */
  getDefaultConfig(gameMode, overrides) {
    const defaults = {
      tdm: {
        name: 'Team Deathmatch',
        teams: ['team_a', 'team_b'],
        scoreLimit: 50,
        timeLimit: 600, // 10 minutes
        respawnDelay: 5,
        friendlyFire: false,
        maxRounds: 1,
      },
      ffa: {
        name: 'Free For All',
        teams: [],
        scoreLimit: 30,
        timeLimit: 600,
        respawnDelay: 3,
        friendlyFire: true,
        maxRounds: 1,
      },
      koth: {
        name: 'King of the Hill',
        teams: ['team_a', 'team_b'],
        scoreLimit: 200,
        timeLimit: 600,
        respawnDelay: 5,
        friendlyFire: false,
        captureRate: 1, // points per second when holding objective
        maxRounds: 3,
      },
    };
    
    return { ...defaults[gameMode], ...overrides };
  }
  
  /**
   * Start the match
   */
  start() {
    this.state = 'active';
    this.startTime = Date.now();
    this.endTime = null;
    
    // Initialize scores
    if (this.config.teams.length > 0) {
      for (const team of this.config.teams) {
        this.scores[team] = 0;
      }
    }
    
    // Initialize objectives for KOTH
    if (this.gameMode === 'koth') {
      this.initializeObjectives();
    }
    
    console.log(`Match started: ${this.config.name} (Round ${this.roundNumber}/${this.maxRounds})`);
  }
  
  /**
   * Initialize objectives (for KOTH)
   */
  initializeObjectives() {
    this.objectives = [
      {
        id: 'hill_1',
        type: 'control_point',
        position: { x: 0, y: 0, z: 0 },
        radius: 5,
        controllingTeam: null,
        contestedBy: [],
        active: true,
      }
    ];
  }
  
  /**
   * Register a kill
   */
  registerKill(killerId, victimId, weaponId, headshot = false) {
    // Update player stats
    this.updatePlayerStat(killerId, 'kills', 1);
    this.updatePlayerStat(victimId, 'deaths', 1);
    
    if (headshot) {
      this.updatePlayerStat(killerId, 'headshots', 1);
    }
    
    // Update scores based on game mode
    if (this.gameMode === 'ffa') {
      // FFA: individual scores
      this.scores[killerId] = (this.scores[killerId] || 0) + 1;
    } else if (this.config.teams.length > 0) {
      // Team-based: add to team score
      const killerTeam = this.getPlayerTeam(killerId);
      const victimTeam = this.getPlayerTeam(victimId);
      
      // Don't award points for team kills
      if (killerTeam !== victimTeam) {
        this.scores[killerTeam] = (this.scores[killerTeam] || 0) + 1;
      }
    }
    
    // Check win condition
    this.checkWinCondition();
    
    return {
      killerId,
      victimId,
      weaponId,
      headshot,
      killerScore: this.getPlayerScore(killerId),
      victimScore: this.getPlayerScore(victimId),
    };
  }
  
  /**
   * Update objective status
   */
  updateObjectives(playerPositions) {
    if (this.gameMode !== 'koth') return;
    
    for (const objective of this.objectives) {
      if (!objective.active) continue;
      
      // Find players in objective radius
      const playersInZone = [];
      for (const [playerId, position] of Object.entries(playerPositions)) {
        const distance = this.distance(position, objective.position);
        if (distance <= objective.radius) {
          playersInZone.push({
            playerId,
            team: this.getPlayerTeam(playerId),
          });
        }
      }
      
      // Determine control
      const teamCounts = {};
      for (const player of playersInZone) {
        teamCounts[player.team] = (teamCounts[player.team] || 0) + 1;
      }
      
      const teams = Object.keys(teamCounts);
      
      if (teams.length === 0) {
        // No one in zone - neutral
        objective.controllingTeam = null;
        objective.contested = false;
      } else if (teams.length === 1) {
        // Single team - they control it
        objective.controllingTeam = teams[0];
        objective.contested = false;
        
        // Award points
        const pointsPerTick = this.config.captureRate / 30; // 30 ticks per second
        this.scores[teams[0]] = (this.scores[teams[0]] || 0) + pointsPerTick;
      } else {
        // Multiple teams - contested
        objective.contested = true;
      }
      
      objective.contestedBy = playersInZone;
    }
    
    this.checkWinCondition();
  }
  
  /**
   * Check if match should end
   */
  checkWinCondition() {
    if (this.state !== 'active') return false;
    
    // Check score limit
    for (const [team, score] of Object.entries(this.scores)) {
      if (score >= this.config.scoreLimit) {
        this.endMatch(team);
        return true;
      }
    }
    
    // Check time limit
    if (this.startTime) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (elapsed >= this.config.timeLimit) {
        this.endMatchByTime();
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * End match with winner
   */
  endMatch(winner) {
    this.state = 'ended';
    this.endTime = Date.now();
    
    console.log(`Match ended: Winner is ${winner}`);
    
    // Check if we need another round
    if (this.roundNumber < this.maxRounds) {
      // TODO: Prepare next round
    }
    
    return {
      winner,
      finalScores: { ...this.scores },
      duration: (this.endTime - this.startTime) / 1000,
    };
  }
  
  /**
   * End match by time limit
   */
  endMatchByTime() {
    this.state = 'ended';
    this.endTime = Date.now();
    
    // Determine winner by highest score
    let winner = null;
    let highestScore = -Infinity;
    
    for (const [team, score] of Object.entries(this.scores)) {
      if (score > highestScore) {
        highestScore = score;
        winner = team;
      }
    }
    
    console.log(`Match ended by time: Winner is ${winner}`);
    
    return {
      winner,
      finalScores: { ...this.scores },
      duration: this.config.timeLimit,
      endReason: 'time_limit',
    };
  }
  
  /**
   * Get player score
   */
  getPlayerScore(playerId) {
    if (this.gameMode === 'ffa') {
      return this.scores[playerId] || 0;
    } else {
      const team = this.getPlayerTeam(playerId);
      return this.scores[team] || 0;
    }
  }
  
  /**
   * Get player stats
   */
  getPlayerStats(playerId) {
    return this.playerStats.get(playerId) || {
      kills: 0,
      deaths: 0,
      assists: 0,
      headshots: 0,
      damage: 0,
    };
  }
  
  /**
   * Update player stat
   */
  updatePlayerStat(playerId, stat, value) {
    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
        kills: 0,
        deaths: 0,
        assists: 0,
        headshots: 0,
        damage: 0,
      });
    }
    
    const stats = this.playerStats.get(playerId);
    stats[stat] = (stats[stat] || 0) + value;
  }
  
  /**
   * Get player team (stub - should be provided by room)
   */
  getPlayerTeam(playerId) {
    // This should be maintained by the Room
    // For now, return a default
    return this.playerTeams?.get(playerId) || 'team_a';
  }
  
  /**
   * Set player teams
   */
  setPlayerTeams(teams) {
    this.playerTeams = new Map(teams);
  }
  
  /**
   * Get match state for snapshot
   */
  getMatchState() {
    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const remaining = Math.max(0, this.config.timeLimit - elapsed);
    
    return {
      gameMode: this.gameMode,
      state: this.state,
      scores: { ...this.scores },
      objectives: this.objectives.map(obj => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        radius: obj.radius,
        controllingTeam: obj.controllingTeam,
        contested: obj.contested,
        playersInZone: obj.contestedBy?.length || 0,
      })),
      timeRemaining: remaining,
      roundNumber: this.roundNumber,
      maxRounds: this.maxRounds,
    };
  }
  
  /**
   * Calculate distance helper
   */
  distance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Reset match for new round
   */
  reset() {
    this.state = 'waiting';
    this.startTime = null;
    this.endTime = null;
    this.scores = {};
    this.playerStats.clear();
    this.objectives = [];
  }
}
