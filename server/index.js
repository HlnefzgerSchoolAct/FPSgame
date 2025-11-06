/**
 * Server - Main multiplayer server
 * WebSocket server with room management, tick loop, and heartbeats
 */

import { authSystem, generateTestToken } from './auth/Auth.js';
import { lobbySystem } from './rooms/Lobby.js';
import { playerDataStore } from './persistence/PlayerData.js';
import { shopSystem } from './economy/Shop.js';
import { 
  decodeMessage, 
  MessageType, 
  createJoinedMessage,
  createErrorMessage,
  createShopInventoryMessage,
  createEconomyUpdateMessage,
  Validation 
} from './protocol/Schema.js';
import { createHttpServer, startServer, gracefulShutdown } from './httpServer.js';

const PORT = process.env.PORT || 3001;
const HEARTBEAT_INTERVAL = Validation.HEARTBEAT_INTERVAL_MS;
const HEARTBEAT_TIMEOUT = Validation.HEARTBEAT_TIMEOUT_MS;

export class GameServer {
  constructor(port = PORT) {
    this.port = port;
    this.wss = null;
    this.httpServer = null;
    this.clients = new Map(); // ws -> client data
    this.rateLimiters = new Map(); // playerId -> rate limiter
  }
  
  /**
   * Start the server
   */
  async start() {
    console.log(`🚀 Game server starting on port ${this.port}`);
    
    // Create HTTP server with WebSocket support
    this.httpServer = createHttpServer(this, { port: this.port });
    
    // Start listening
    await startServer(this.httpServer, this.port);
    
    // Start periodic tasks
    this.startHeartbeat();
    this.startCleanup();
    lobbySystem.startCleanup();
    
    console.log('✅ Game server ready');
    console.log(`   Test token: ${generateTestToken()}`);
  }
  
  /**
   * Handle new connection
   */
  handleConnection(ws, req) {
    const ip = req.socket.remoteAddress;
    
    // Rate limit connections
    if (!authSystem.checkRateLimit(ip, 10, 60000)) {
      ws.close(1008, 'Rate limit exceeded');
      return;
    }
    
    console.log(`New connection from ${ip}`);
    
    // Initialize client data
    const client = {
      ws,
      ip,
      playerId: null,
      authenticated: false,
      lastHeartbeat: Date.now(),
      lastMessageTime: Date.now(),
      messageCount: 0,
    };
    
    this.clients.set(ws, client);
    
    // Handle messages
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });
    
    // Handle disconnect
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }
  
  /**
   * Handle incoming message
   */
  handleMessage(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    // Rate limit messages
    const now = Date.now();
    const timeSinceLastMessage = now - client.lastMessageTime;
    
    if (timeSinceLastMessage < 10) { // Max 100 msg/s per client
      client.messageCount++;
      if (client.messageCount > 120) {
        console.warn(`Rate limit exceeded for ${client.playerId || client.ip}`);
        ws.close(1008, 'Rate limit exceeded');
        return;
      }
    } else {
      client.messageCount = 0;
    }
    
    client.lastMessageTime = now;
    
    // Decode message
    const message = decodeMessage(data);
    if (!message) {
      console.error('Failed to decode message');
      return;
    }
    
    // Handle message by type
    switch (message.type) {
      case MessageType.JOIN:
        this.handleJoin(ws, message.payload);
        break;
        
      case MessageType.INPUT:
        this.handleInput(ws, message.payload);
        break;
        
      case MessageType.FIRE:
        this.handleFire(ws, message.payload);
        break;
        
      case MessageType.SHOP_PURCHASE:
        this.handleShopPurchase(ws, message.payload);
        break;
        
      case MessageType.EQUIP_LOADOUT:
        this.handleEquipLoadout(ws, message.payload);
        break;
        
      case MessageType.HEARTBEAT:
        this.handleHeartbeat(ws, message.payload);
        break;
        
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }
  
  /**
   * Handle JOIN message
   */
  handleJoin(ws, payload) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    // Authenticate
    const auth = authSystem.authenticate(payload.token);
    
    if (!auth.success) {
      ws.send(createErrorMessage('AUTH_FAILED', auth.error));
      ws.close(1008, 'Authentication failed');
      return;
    }
    
    client.playerId = auth.playerId;
    client.authenticated = true;
    
    // Get player data
    const playerData = playerDataStore.getPlayer(auth.playerId);
    playerDataStore.updateLastSeen(auth.playerId);
    
    console.log(`Player ${auth.playerId} authenticated`);
    
    // Queue for matchmaking
    const region = payload.region || 'auto';
    const queueResult = lobbySystem.queuePlayer(
      auth.playerId,
      playerData,
      ws,
      region
    );
    
    if (!queueResult.success) {
      ws.send(createErrorMessage('QUEUE_FAILED', queueResult.error));
      return;
    }
    
    // Send initial data
    const shopRotation = shopSystem.getShopRotation();
    ws.send(createShopInventoryMessage(shopRotation.featured, []));
    ws.send(createEconomyUpdateMessage(playerData.currencies, playerData.inventory));
    
    // Note: JOINED message will be sent when room is ready
    console.log(`Player ${auth.playerId} queued (position: ${queueResult.queuePosition})`);
  }
  
  /**
   * Handle INPUT message
   */
  handleInput(ws, payload) {
    const client = this.clients.get(ws);
    if (!client || !client.authenticated) return;
    
    const room = lobbySystem.getPlayerRoom(client.playerId);
    if (!room) return;
    
    room.processInput(client.playerId, payload);
  }
  
  /**
   * Handle FIRE message
   */
  handleFire(ws, payload) {
    const client = this.clients.get(ws);
    if (!client || !client.authenticated) return;
    
    const room = lobbySystem.getPlayerRoom(client.playerId);
    if (!room) return;
    
    room.processFire(client.playerId, payload);
  }
  
  /**
   * Handle SHOP_PURCHASE message
   */
  handleShopPurchase(ws, payload) {
    const client = this.clients.get(ws);
    if (!client || !client.authenticated) return;
    
    const result = shopSystem.processPurchase(
      client.playerId,
      payload.itemId,
      payload.currency,
      payload.price
    );
    
    if (result.success) {
      // Send economy update
      ws.send(createEconomyUpdateMessage(result.newBalance, 
        playerDataStore.getPlayer(client.playerId).inventory));
    } else {
      ws.send(createErrorMessage(result.code, result.error));
    }
  }
  
  /**
   * Handle EQUIP_LOADOUT message
   */
  handleEquipLoadout(ws, payload) {
    const client = this.clients.get(ws);
    if (!client || !client.authenticated) return;
    
    // Update player loadout in persistence
    const player = playerDataStore.getPlayer(client.playerId);
    if (player.loadouts && player.loadouts[0]) {
      Object.assign(player.loadouts[0], payload.loadout);
    }
    
    console.log(`Player ${client.playerId} equipped loadout`);
  }
  
  /**
   * Handle HEARTBEAT message
   */
  handleHeartbeat(ws, payload) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    client.lastHeartbeat = Date.now();
  }
  
  /**
   * Handle disconnect
   */
  handleDisconnect(ws) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    console.log(`Player ${client.playerId || 'unknown'} disconnected`);
    
    if (client.playerId) {
      // Remove from queue
      lobbySystem.dequeuePlayer(client.playerId);
      
      // Remove from room
      lobbySystem.removePlayerFromRoom(client.playerId);
    }
    
    this.clients.delete(ws);
  }
  
  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      const toDisconnect = [];
      
      for (const [ws, client] of this.clients) {
        const timeSinceHeartbeat = now - client.lastHeartbeat;
        
        if (timeSinceHeartbeat > HEARTBEAT_TIMEOUT) {
          console.log(`Player ${client.playerId || 'unknown'} timed out`);
          toDisconnect.push(ws);
        }
      }
      
      // Disconnect timed out clients
      for (const ws of toDisconnect) {
        ws.close(1000, 'Heartbeat timeout');
      }
    }, HEARTBEAT_INTERVAL);
  }
  
  /**
   * Start periodic cleanup
   */
  startCleanup() {
    setInterval(() => {
      // Cleanup auth rate limits
      authSystem.cleanupRateLimits();
      
      // Cleanup old sessions
      playerDataStore.cleanupSessions();
      
      // Rotate shop
      shopSystem.rotateShop();
    }, 300000); // Every 5 minutes
  }
  
  /**
   * Get server statistics
   */
  getStatistics() {
    const lobbyStats = lobbySystem.getStatistics();
    
    return {
      uptime: process.uptime(),
      connections: this.clients.size,
      authenticated: Array.from(this.clients.values()).filter(c => c.authenticated).length,
      ...lobbyStats,
    };
  }
  
  /**
   * Stop the server
   */
  async stop() {
    if (this.httpServer) {
      await gracefulShutdown(this.httpServer, this);
    } else {
      console.log('Server stopped');
    }
  }
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GameServer();
  
  // Start server
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  
  // Log statistics periodically
  setInterval(() => {
    const stats = server.getStatistics();
    console.log(`📊 Stats: ${stats.connections} connected, ${stats.queued} queued, ${stats.inGame} in game, ${stats.totalRooms} rooms`);
  }, 30000);
  
  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, shutting down...`);
    await server.stop();
    process.exit(0);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default GameServer;
