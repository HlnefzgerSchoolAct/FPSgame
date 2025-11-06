/**
 * Health Check Endpoints
 * Provides /healthz and /readyz endpoints for monitoring
 */

/**
 * Health check - basic liveness probe
 * Returns 200 if server is running
 */
export function healthzHandler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));
}

/**
 * Readiness check - checks if server is ready to accept traffic
 * Returns 200 if server is ready, 503 if not ready
 */
export function readyzHandler(req, res, server) {
  const checks = [];
  let ready = true;

  // Check if WebSocket server is running
  if (server && server.wss) {
    checks.push({
      name: 'websocket_server',
      status: 'healthy',
    });
  } else {
    checks.push({
      name: 'websocket_server',
      status: 'unhealthy',
    });
    ready = false;
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (memUsagePercent > 90) {
    checks.push({
      name: 'memory',
      status: 'unhealthy',
      message: `Memory usage at ${memUsagePercent.toFixed(1)}%`,
    });
    ready = false;
  } else {
    checks.push({
      name: 'memory',
      status: 'healthy',
      usage: `${memUsagePercent.toFixed(1)}%`,
    });
  }

  // Check if server has been running for minimum time
  const minUptime = 5; // 5 seconds
  if (process.uptime() < minUptime) {
    checks.push({
      name: 'startup',
      status: 'starting',
      uptime: process.uptime(),
    });
    ready = false;
  } else {
    checks.push({
      name: 'startup',
      status: 'healthy',
      uptime: process.uptime(),
    });
  }

  // TODO: Add database connectivity check
  // TODO: Add Redis connectivity check

  const status = ready ? 'ready' : 'not_ready';
  const statusCode = ready ? 200 : 503;

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status,
    timestamp: new Date().toISOString(),
    checks,
  }));
}

/**
 * Create health check router
 * @param {Object} server - Game server instance
 * @returns {Function} Request handler
 */
export function createHealthRouter(server) {
  return (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname === '/healthz') {
      healthzHandler(req, res);
    } else if (url.pathname === '/readyz') {
      readyzHandler(req, res, server);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  };
}

export default {
  healthzHandler,
  readyzHandler,
  createHealthRouter,
};
