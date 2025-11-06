/**
 * Metrics Middleware
 * Prometheus-compatible metrics for monitoring
 */

class Metrics {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  // Counter - monotonically increasing value
  incrementCounter(name, labels = {}, value = 1) {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || { name, labels, value: 0 };
    current.value += value;
    this.counters.set(key, current);
  }

  // Gauge - value that can go up or down
  setGauge(name, labels = {}, value) {
    const key = this.getKey(name, labels);
    this.gauges.set(key, { name, labels, value });
  }

  incrementGauge(name, labels = {}, value = 1) {
    const key = this.getKey(name, labels);
    const current = this.gauges.get(key) || { name, labels, value: 0 };
    current.value += value;
    this.gauges.set(key, current);
  }

  decrementGauge(name, labels = {}, value = 1) {
    this.incrementGauge(name, labels, -value);
  }

  // Histogram - distribution of values
  recordHistogram(name, labels = {}, value) {
    const key = this.getKey(name, labels);
    const histogram = this.histograms.get(key) || {
      name,
      labels,
      sum: 0,
      count: 0,
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      bucketCounts: {},
    };

    histogram.sum += value;
    histogram.count += 1;

    // Update buckets
    for (const bucket of histogram.buckets) {
      if (value <= bucket) {
        histogram.bucketCounts[bucket] = (histogram.bucketCounts[bucket] || 0) + 1;
      }
    }

    this.histograms.set(key, histogram);
  }

  getKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  // Export in Prometheus format
  export() {
    let output = '';

    // Counters
    for (const [, metric] of this.counters) {
      const labels = this.formatLabels(metric.labels);
      output += `# TYPE ${metric.name} counter\n`;
      output += `${metric.name}${labels} ${metric.value}\n`;
    }

    // Gauges
    for (const [, metric] of this.gauges) {
      const labels = this.formatLabels(metric.labels);
      output += `# TYPE ${metric.name} gauge\n`;
      output += `${metric.name}${labels} ${metric.value}\n`;
    }

    // Histograms
    for (const [, histogram] of this.histograms) {
      const labels = this.formatLabels(histogram.labels);
      output += `# TYPE ${histogram.name} histogram\n`;

      for (const bucket of histogram.buckets) {
        const bucketLabels = this.formatLabels({
          ...histogram.labels,
          le: bucket,
        });
        const count = histogram.bucketCounts[bucket] || 0;
        output += `${histogram.name}_bucket${bucketLabels} ${count}\n`;
      }

      const infLabels = this.formatLabels({
        ...histogram.labels,
        le: '+Inf',
      });
      output += `${histogram.name}_bucket${infLabels} ${histogram.count}\n`;
      output += `${histogram.name}_sum${labels} ${histogram.sum}\n`;
      output += `${histogram.name}_count${labels} ${histogram.count}\n`;
    }

    return output;
  }

  formatLabels(labels) {
    if (!labels || Object.keys(labels).length === 0) return '';
    
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    
    return `{${labelStr}}`;
  }

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Global metrics instance
let globalMetrics = null;

/**
 * Get or create global metrics instance
 * @returns {Metrics} Metrics instance
 */
export function getMetrics() {
  if (!globalMetrics) {
    globalMetrics = new Metrics();
  }
  return globalMetrics;
}

/**
 * Record HTTP request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} status - Response status code
 * @param {number} duration - Request duration in seconds
 */
export function recordHttpRequest(method, path, status, duration) {
  const metrics = getMetrics();
  
  // Normalize path (remove various ID patterns)
  let normalizedPath = path;
  // Remove UUIDs (8-4-4-4-12 hex digits)
  normalizedPath = normalizedPath.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
  // Remove other hex/alphanumeric IDs (6+ chars)
  normalizedPath = normalizedPath.replace(/\/[0-9a-zA-Z_-]{6,}/g, '/:id');
  // Remove query strings
  normalizedPath = normalizedPath.split('?')[0];
  
  metrics.incrementCounter('http_requests_total', {
    method,
    path: normalizedPath,
    status: Math.floor(status / 100) + 'xx',
  });
  
  metrics.recordHistogram('http_request_duration_seconds', {
    method,
    path: normalizedPath,
  }, duration);
}

/**
 * Record WebSocket connection
 * @param {string} event - Event type (connect, disconnect, error)
 */
export function recordWebSocketEvent(event) {
  const metrics = getMetrics();
  metrics.incrementCounter('websocket_events_total', { event });
}

/**
 * Set active connections gauge
 * @param {number} count - Number of active connections
 */
export function setActiveConnections(count) {
  const metrics = getMetrics();
  metrics.setGauge('websocket_connections_active', {}, count);
}

/**
 * Record game event
 * @param {string} event - Event type
 * @param {Object} labels - Additional labels
 */
export function recordGameEvent(event, labels = {}) {
  const metrics = getMetrics();
  metrics.incrementCounter('game_events_total', { event, ...labels });
}

/**
 * Middleware to track HTTP requests
 * @returns {Function} Middleware function
 */
export function metricsMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    
    // Capture response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = (Date.now() - start) / 1000;
      recordHttpRequest(req.method, req.url, res.statusCode, duration);
      originalEnd.apply(res, args);
    };
    
    next();
  };
}

/**
 * Handler for /metrics endpoint
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
export function metricsHandler(req, res) {
  const metrics = getMetrics();
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.end(metrics.export());
}

export default {
  getMetrics,
  recordHttpRequest,
  recordWebSocketEvent,
  setActiveConnections,
  recordGameEvent,
  metricsMiddleware,
  metricsHandler,
  Metrics,
};
