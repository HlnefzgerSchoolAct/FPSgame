/**
 * NetEvents - Bridge between networking and gameplay/UI
 * Event-based communication layer
 */

export class NetworkEventBridge {
  constructor() {
    this.listeners = new Map();
  }
  
  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Emit event
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }
  
  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
  
  /**
   * Clear listeners for specific event
   */
  clearEvent(event) {
    this.listeners.delete(event);
  }
}

// Event constants
export const NetEvent = {
  // Connection events
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTION_ERROR: 'connectionError',
  RECONNECTING: 'reconnecting',
  
  // Authentication events
  AUTHENTICATED: 'authenticated',
  AUTH_FAILED: 'authFailed',
  
  // Room events
  JOINED_ROOM: 'joinedRoom',
  LEFT_ROOM: 'leftRoom',
  ROOM_FULL: 'roomFull',
  
  // Match events
  MATCH_STARTED: 'matchStarted',
  MATCH_ENDED: 'matchEnded',
  ROUND_STARTED: 'roundStarted',
  ROUND_ENDED: 'roundEnded',
  
  // Player events
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_SPAWNED: 'playerSpawned',
  PLAYER_DIED: 'playerDied',
  PLAYER_KILLED: 'playerKilled',
  
  // Combat events
  DAMAGE_TAKEN: 'damageTaken',
  DAMAGE_DEALT: 'damageDealt',
  KILL: 'kill',
  DEATH: 'death',
  HIT_CONFIRMED: 'hitConfirmed',
  
  // Objective events
  OBJECTIVE_CAPTURED: 'objectiveCaptured',
  OBJECTIVE_LOST: 'objectiveLost',
  OBJECTIVE_CONTESTED: 'objectiveContested',
  
  // Score events
  SCORE_UPDATE: 'scoreUpdate',
  TEAM_SCORE_UPDATE: 'teamScoreUpdate',
  
  // Economy events
  CURRENCY_UPDATE: 'currencyUpdate',
  ITEM_PURCHASED: 'itemPurchased',
  PURCHASE_FAILED: 'purchaseFailed',
  INVENTORY_UPDATE: 'inventoryUpdate',
  SHOP_ROTATION: 'shopRotation',
  
  // Loadout events
  LOADOUT_EQUIPPED: 'loadoutEquipped',
  WEAPON_SWITCHED: 'weaponSwitched',
  
  // Network events
  SNAPSHOT_RECEIVED: 'snapshotReceived',
  LATENCY_UPDATE: 'latencyUpdate',
  RECONCILIATION: 'reconciliation',
  
  // Error events
  SERVER_ERROR: 'serverError',
  KICKED: 'kicked',
  BANNED: 'banned',
};

// Singleton instance
export const netEvents = new NetworkEventBridge();

export default {
  NetworkEventBridge,
  NetEvent,
  netEvents,
};
