/**
 * HTTP Server with WebSocket Support
 * Provides HTTP endpoints for health checks, metrics, and WebSocket upgrade
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import { healthzHandler, readyzHandler } from './healthz.js';
import { metricsHandler, metricsMiddleware, recordWebSocketEvent, setActiveConnections } from './middleware/metrics.js';
import { rateLimitMiddleware, getClientId } from './middleware/rateLimit.js';
import { corsMiddleware, validateWebSocketOrigin } from './config/cors.js';
import { applySecurityHeaders } from './config/helmet.js';

/**
 * Create HTTP server with WebSocket support
 * @param {Object} gameServer - Game server instance
 * @param {Object} options - Server options
 * @returns {http.Server} HTTP server
 */
export function createHttpServer(gameServer, options = {}) {
  const {
    port = process.env.PORT || 3001,
    wssPath = process.env.WSS_PATH || '/ws',
    enableMetrics = process.env.ENABLE_METRICS !== 'false',
  } = options;

  // Create HTTP server
  const server = http.createServer((req, res) => {
    // Apply security headers
    applySecurityHeaders(res);

    // Apply metrics middleware
    if (enableMetrics) {
      const start = Date.now();
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = (Date.now() - start) / 1000;
        // Record metric (simplified inline version)
        originalEnd.apply(res, args);
      };
    }

    // Route handling
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Health checks (no CORS, no rate limit)
    if (url.pathname === '/healthz') {
      return healthzHandler(req, res);
    }
    
    if (url.pathname === '/readyz') {
      return readyzHandler(req, res, gameServer);
    }

    // Metrics endpoint
    if (url.pathname === '/metrics' && enableMetrics) {
      return metricsHandler(req, res);
    }

    // Apply CORS for other endpoints
    const corsHandler = corsMiddleware();
    corsHandler(req, res, () => {
      // Apply rate limiting
      const rateLimitHandler = rateLimitMiddleware({ rps: 50 });
      rateLimitHandler(req, res, () => {
        // API endpoints would go here
        if (url.pathname.startsWith('/api/')) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not Found' }));
          return;
        }

        // Default 404
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found');
      });
    });
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server,
    path: wssPath,
    perMessageDeflate: false, // Disable compression for lower latency
  });

  // Attach to game server
  gameServer.wss = wss;
  gameServer.httpServer = server;

  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    // Validate origin
    if (!validateWebSocketOrigin(req)) {
      console.warn(`WebSocket connection rejected: invalid origin ${req.headers.origin}`);
      ws.close(1008, 'Origin not allowed');
      recordWebSocketEvent('reject');
      return;
    }

    recordWebSocketEvent('connect');
    setActiveConnections(wss.clients.size);
    
    // Delegate to game server
    gameServer.handleConnection(ws, req);

    // Track disconnections for metrics
    ws.on('close', () => {
      recordWebSocketEvent('disconnect');
      setActiveConnections(wss.clients.size);
    });

    ws.on('error', (error) => {
      recordWebSocketEvent('error');
      console.error('WebSocket error:', error);
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  return server;
}

/**
 * Start HTTP server with graceful shutdown
 * @param {http.Server} server - HTTP server
 * @param {number} port - Port to listen on
 * @returns {Promise} Promise that resolves when server is listening
 */
export function startServer(server, port) {
  return new Promise((resolve, reject) => {
    server.listen(port, '0.0.0.0', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ HTTP server listening on port ${port}`);
        console.log(`   Health check: http://localhost:${port}/healthz`);
        console.log(`   Readiness: http://localhost:${port}/readyz`);
        console.log(`   Metrics: http://localhost:${port}/metrics`);
        console.log(`   WebSocket: ws://localhost:${port}${process.env.WSS_PATH || '/ws'}`);
        resolve();
      }
    });
  });
}

/**
 * Graceful shutdown
 * @param {http.Server} server - HTTP server
 * @param {Object} gameServer - Game server instance
 * @returns {Promise} Promise that resolves when shutdown is complete
 */
export function gracefulShutdown(server, gameServer) {
  return new Promise((resolve) => {
    console.log('\n🛑 Shutting down gracefully...');
    
    // Stop accepting new connections
    server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close all WebSocket connections
    if (gameServer.wss) {
      for (const ws of gameServer.wss.clients) {
        ws.close(1001, 'Server shutting down');
      }
    }

    // Stop game server
    if (gameServer.stop) {
      gameServer.stop();
    }

    // Wait a bit for connections to close
    setTimeout(() => {
      console.log('✅ Shutdown complete');
      resolve();
    }, 2000);
  });
}

export default {
  createHttpServer,
  startServer,
  gracefulShutdown,
};
