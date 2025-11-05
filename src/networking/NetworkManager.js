/**
 * NetworkManager - Main networking coordinator
 * Integrates client, prediction, reconciliation, and interpolation
 */

import NetworkClient from './Client.js';
import PredictionSystem from './Prediction.js';
import ReconciliationSystem from './Reconciliation.js';
import InterpolationBuffer from './InterpolationBuffer.js';
import { netEvents, NetEvent } from './NetEvents.js';
import {
  MessageType,
  EventType,
  createJoinMessage,
  createInputMessage,
  createFireMessage,
  createShopPurchaseMessage,
  createEquipLoadoutMessage,
  createActionMask,
} from './ProtocolClient.js';

export class NetworkManager {
  constructor(serverUrl = 'ws://localhost:3001') {
    this.client = new NetworkClient(serverUrl);
    this.prediction = new PredictionSystem();
    this.reconciliation = new ReconciliationSystem(this.prediction);
    this.interpolation = new InterpolationBuffer(100); // 100ms buffer
    
    this.playerId = null;
    this.roomId = null;
    this.matchConfig = null;
    
    // Input rate control
    this.lastInputTime = 0;
    this.inputRate = 1000 / 60; // 60Hz
    
    // Fire rate control
    this.lastFireTime = 0;
    this.fireRate = 1000 / 30; // 30Hz max
    
    // Setup message handlers
    this.setupHandlers();
    
    // Setup client callbacks
    this.client.onConnect = () => this.handleConnect();
    this.client.onDisconnect = (code, reason) => this.handleDisconnect(code, reason);
    this.client.onError = (error) => this.handleError(error);
  }
  
  /**
   * Setup message handlers
   */
  setupHandlers() {
    this.client.on(MessageType.JOINED, (payload) => this.handleJoined(payload));
    this.client.on(MessageType.SNAPSHOT, (payload) => this.handleSnapshot(payload));
    this.client.on(MessageType.EVENT, (payload) => this.handleEvent(payload));
    this.client.on(MessageType.RECONCILE, (payload) => this.handleReconcile(payload));
    this.client.on(MessageType.SHOP_INVENTORY, (payload) => this.handleShopInventory(payload));
    this.client.on(MessageType.ECONOMY_UPDATE, (payload) => this.handleEconomyUpdate(payload));
    this.client.on(MessageType.ERROR, (payload) => this.handleServerError(payload));
  }
  
  /**
   * Connect to server
   */
  connect(sessionToken) {
    this.client.connect(sessionToken);
  }
  
  /**
   * Disconnect from server
   */
  disconnect() {
    this.client.disconnect();
    this.reset();
  }
  
  /**
   * Handle connection established
   */
  handleConnect() {
    console.log('Connected to server');
    netEvents.emit(NetEvent.CONNECTED);
  }
  
  /**
   * Handle disconnection
   */
  handleDisconnect(code, reason) {
    console.log(`Disconnected: ${reason} (${code})`);
    netEvents.emit(NetEvent.DISCONNECTED, { code, reason });
  }
  
  /**
   * Handle connection error
   */
  handleError(error) {
    console.error('Connection error:', error);
    netEvents.emit(NetEvent.CONNECTION_ERROR, error);
  }
  
  /**
   * Handle JOINED message
   */
  handleJoined(payload) {
    this.playerId = payload.playerId;
    this.roomId = payload.roomId;
    this.matchConfig = payload.config;
    
    console.log(`Joined room ${this.roomId} as player ${this.playerId}`);
    netEvents.emit(NetEvent.JOINED_ROOM, {
      playerId: this.playerId,
      roomId: this.roomId,
      config: this.matchConfig,
    });
  }
  
  /**
   * Handle SNAPSHOT message
   */
  handleSnapshot(payload) {
    // Add to interpolation buffer
    this.interpolation.addSnapshot({
      players: payload.players,
      projectiles: payload.projectiles,
      objectives: payload.objectives,
    }, payload.tick);
    
    // Reconcile own state
    if (payload.you && payload.ack) {
      const result = this.reconciliation.reconcile(payload.you, payload.ack);
      
      if (result.corrected && result.error > 1.0) {
        console.log(`Reconciled with error: ${result.error.toFixed(2)}m`);
        netEvents.emit(NetEvent.RECONCILIATION, result);
      }
    }
    
    netEvents.emit(NetEvent.SNAPSHOT_RECEIVED, payload);
  }
  
  /**
   * Handle EVENT message
   */
  handleEvent(payload) {
    switch (payload.type) {
      case EventType.KILL:
        netEvents.emit(NetEvent.KILL, payload.data);
        if (payload.data.killer === this.playerId) {
          netEvents.emit(NetEvent.PLAYER_KILLED, payload.data);
        }
        break;
        
      case EventType.DEATH:
        netEvents.emit(NetEvent.DEATH, payload.data);
        if (payload.data.victim === this.playerId) {
          netEvents.emit(NetEvent.PLAYER_DIED, payload.data);
        }
        break;
        
      case EventType.HIT:
        netEvents.emit(NetEvent.HIT_CONFIRMED, payload.data);
        if (payload.data.target === this.playerId) {
          netEvents.emit(NetEvent.DAMAGE_TAKEN, payload.data);
        } else if (payload.data.shooter === this.playerId) {
          netEvents.emit(NetEvent.DAMAGE_DEALT, payload.data);
        }
        break;
        
      case EventType.SCORE:
        netEvents.emit(NetEvent.SCORE_UPDATE, payload.data);
        break;
        
      case EventType.OBJECTIVE:
        netEvents.emit(NetEvent.OBJECTIVE_CAPTURED, payload.data);
        break;
        
      default:
        console.log('Unhandled event:', payload);
    }
  }
  
  /**
   * Handle RECONCILE message
   */
  handleReconcile(payload) {
    const result = this.reconciliation.reconcile(payload.state, payload.tick);
    netEvents.emit(NetEvent.RECONCILIATION, result);
  }
  
  /**
   * Handle SHOP_INVENTORY message
   */
  handleShopInventory(payload) {
    netEvents.emit(NetEvent.SHOP_ROTATION, payload);
  }
  
  /**
   * Handle ECONOMY_UPDATE message
   */
  handleEconomyUpdate(payload) {
    netEvents.emit(NetEvent.CURRENCY_UPDATE, payload.currencies);
    netEvents.emit(NetEvent.INVENTORY_UPDATE, payload.inventory);
  }
  
  /**
   * Handle ERROR message
   */
  handleServerError(payload) {
    console.error(`Server error: ${payload.msg} (${payload.code})`);
    netEvents.emit(NetEvent.SERVER_ERROR, payload);
  }
  
  /**
   * Send input to server with prediction
   */
  sendInput(moveInput, lookInput, actions, weaponId, deltaTime) {
    // Rate limit
    const now = Date.now();
    if (now - this.lastInputTime < this.inputRate) {
      return false;
    }
    this.lastInputTime = now;
    
    // Apply prediction
    const result = this.prediction.applyInput(
      { move: moveInput, look: lookInput },
      actions,
      deltaTime
    );
    
    if (!result) return false;
    
    // Create action mask
    const actionMask = createActionMask(actions);
    
    // Send to server
    const message = createInputMessage(
      result.seq,
      deltaTime,
      moveInput,
      lookInput,
      actionMask,
      weaponId,
      now
    );
    
    return this.client.send(message);
  }
  
  /**
   * Send fire event to server
   */
  sendFire(weaponState) {
    // Rate limit
    const now = Date.now();
    if (now - this.lastFireTime < this.fireRate) {
      return false;
    }
    this.lastFireTime = now;
    
    const message = createFireMessage(
      this.prediction.inputSequence,
      weaponState,
      now
    );
    
    return this.client.send(message);
  }
  
  /**
   * Purchase item from shop
   */
  purchaseItem(itemId, currency, price) {
    const message = createShopPurchaseMessage(itemId, currency, price);
    return this.client.send(message);
  }
  
  /**
   * Equip loadout
   */
  equipLoadout(loadout) {
    const message = createEquipLoadoutMessage(loadout);
    return this.client.send(message);
  }
  
  /**
   * Get predicted player state
   */
  getPredictedState() {
    return this.prediction.getState();
  }
  
  /**
   * Get interpolated remote entities
   */
  getInterpolatedEntities() {
    return this.interpolation.getInterpolatedState(Date.now());
  }
  
  /**
   * Get network statistics
   */
  getStatistics() {
    return {
      connection: this.client.getStatistics(),
      interpolation: this.interpolation.getStatistics(),
      prediction: {
        inputSequence: this.prediction.inputSequence,
        historySize: this.prediction.inputHistory.length,
      },
    };
  }
  
  /**
   * Reset state
   */
  reset() {
    this.playerId = null;
    this.roomId = null;
    this.matchConfig = null;
    this.prediction.reset();
    this.interpolation.clear();
  }
  
  /**
   * Check if connected and in room
   */
  isInRoom() {
    return this.client.isConnected() && this.roomId !== null;
  }
}

export default NetworkManager;
