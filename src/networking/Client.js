/**
 * Client - WebSocket client with auto-reconnection and latency measurement
 */

import { 
  decodeMessage, 
  createHeartbeatMessage, 
  MessageType 
} from './ProtocolClient.js';

export class NetworkClient {
  constructor(serverUrl = 'ws://localhost:3001') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.connected = false;
    this.authenticated = false;
    
    // Connection state
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.reconnectTimer = null;
    
    // Latency measurement
    this.latency = 0;
    this.latencyHistory = [];
    this.lastHeartbeatTime = 0;
    this.heartbeatInterval = 1000; // 1 second
    this.heartbeatTimer = null;
    
    // Message handlers
    this.messageHandlers = new Map();
    this.onConnect = null;
    this.onDisconnect = null;
    this.onError = null;
    
    // Queued messages (for when reconnecting)
    this.messageQueue = [];
    this.maxQueueSize = 100;
  }
  
  /**
   * Connect to server
   */
  connect(sessionToken) {
    if (this.ws) {
      console.warn('Already connected or connecting');
      return;
    }
    
    this.sessionToken = sessionToken;
    
    console.log(`Connecting to ${this.serverUrl}...`);
    
    try {
      this.ws = new WebSocket(this.serverUrl);
      this.ws.binaryType = 'arraybuffer';
      
      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from server
   */
  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connected = false;
    this.authenticated = false;
  }
  
  /**
   * Handle connection open
   */
  handleOpen() {
    console.log('Connected to server');
    this.connected = true;
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.flushMessageQueue();
    
    if (this.onConnect) {
      this.onConnect();
    }
  }
  
  /**
   * Handle incoming message
   */
  handleMessage(event) {
    const message = decodeMessage(event.data);
    if (!message) return;
    
    // Update latency on heartbeat response
    if (message.type === MessageType.HEARTBEAT) {
      this.updateLatency();
    }
    
    // Call registered handler
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload, message.timestamp);
    }
  }
  
  /**
   * Handle connection error
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    
    if (this.onError) {
      this.onError(error);
    }
  }
  
  /**
   * Handle connection close
   */
  handleClose(event) {
    console.log(`Disconnected: ${event.reason || 'Unknown reason'} (${event.code})`);
    
    this.connected = false;
    this.authenticated = false;
    this.ws = null;
    
    this.stopHeartbeat();
    
    if (this.onDisconnect) {
      this.onDisconnect(event.code, event.reason);
    }
    
    // Attempt reconnect unless intentional disconnect
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.sessionToken);
    }, delay);
  }
  
  /**
   * Send message to server
   */
  send(data) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push(data);
      }
      return false;
    }
    
    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }
  
  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const data = this.messageQueue.shift();
      this.send(data);
    }
  }
  
  /**
   * Register message handler
   */
  on(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }
  
  /**
   * Unregister message handler
   */
  off(messageType) {
    this.messageHandlers.delete(messageType);
  }
  
  /**
   * Start heartbeat
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.lastHeartbeatTime = Date.now();
        this.send(createHeartbeatMessage(this.lastHeartbeatTime));
      }
    }, this.heartbeatInterval);
  }
  
  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * Update latency measurement
   */
  updateLatency() {
    if (this.lastHeartbeatTime > 0) {
      const roundTripTime = Date.now() - this.lastHeartbeatTime;
      this.latency = roundTripTime / 2; // One-way latency estimate
      
      this.latencyHistory.push(this.latency);
      if (this.latencyHistory.length > 10) {
        this.latencyHistory.shift();
      }
    }
  }
  
  /**
   * Get average latency
   */
  getAverageLatency() {
    if (this.latencyHistory.length === 0) return 0;
    
    const sum = this.latencyHistory.reduce((a, b) => a + b, 0);
    return sum / this.latencyHistory.length;
  }
  
  /**
   * Get connection quality
   */
  getConnectionQuality() {
    const avgLatency = this.getAverageLatency();
    
    if (avgLatency < 50) return 'excellent';
    if (avgLatency < 100) return 'good';
    if (avgLatency < 150) return 'fair';
    return 'poor';
  }
  
  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get connection statistics
   */
  getStatistics() {
    return {
      connected: this.connected,
      authenticated: this.authenticated,
      latency: Math.round(this.latency),
      averageLatency: Math.round(this.getAverageLatency()),
      quality: this.getConnectionQuality(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
    };
  }
}

export default NetworkClient;
