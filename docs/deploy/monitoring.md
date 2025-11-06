# Monitoring and Observability

## Overview

This document describes monitoring setup, metrics, alerts, and dashboards for FPSgame.

## Monitoring Stack

### Built-in Metrics

**Prometheus Endpoint**: `https://fpsgame-api.fly.dev/metrics`

Exposed metrics include:
- HTTP request rates and durations
- WebSocket connection counts
- Game events (kills, deaths, matches)
- System resources (memory, CPU)

### Health Checks

**Health Endpoint**: `/healthz`
- Purpose: Liveness check
- Returns: 200 if server is running
- Used by: Fly.io, uptime monitors

**Readiness Endpoint**: `/readyz`
- Purpose: Readiness check
- Returns: 200 if ready to serve traffic, 503 if not
- Checks: WebSocket server, memory usage, startup time

### Logging

**Structured JSON Logs**:
- Format: Pino-compatible JSON
- Levels: error, warn, info, debug
- Fields: timestamp, level, message, requestId, playerId

**Log Aggregation** (Optional):
- Better Stack (Logtail)
- Datadog
- New Relic

## Key Metrics

### Application Metrics

**Request Metrics**:
```
http_requests_total{method, path, status}          # Counter
http_request_duration_seconds{method, path}        # Histogram
```

**WebSocket Metrics**:
```
websocket_connections_active                        # Gauge
websocket_events_total{event}                       # Counter (connect, disconnect, error)
```

**Game Metrics**:
```
game_events_total{event}                           # Counter (kill, death, match_start, match_end)
players_in_game                                     # Gauge
active_lobbies                                      # Gauge
```

**System Metrics**:
```
process_cpu_seconds_total                          # Counter
process_resident_memory_bytes                      # Gauge
nodejs_heap_size_used_bytes                        # Gauge
```

### Infrastructure Metrics

**Fly.io Provides**:
- Instance count
- CPU usage
- Memory usage
- Network I/O
- Request latency

**Vercel Provides**:
- Function invocations
- Edge request count
- Bandwidth usage
- Cache hit rate

**Neon Provides**:
- Database connections
- Query performance
- Storage usage
- Replication lag

**Upstash Provides**:
- Redis commands/sec
- Memory usage
- Latency
- Hit rate

## Dashboards

### Prometheus/Grafana Dashboard

**Setup**:
1. Deploy Prometheus to scrape `/metrics` endpoint
2. Configure Grafana with Prometheus data source
3. Import dashboard template (see below)

**Panels**:
- Request rate and latency (95th percentile)
- WebSocket connections over time
- Active players and lobbies
- Error rate
- Memory and CPU usage

**Example PromQL Queries**:

```promql
# Request rate
rate(http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active WebSocket connections
websocket_connections_active

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Memory usage percentage
(process_resident_memory_bytes / 512000000) * 100
```

### Fly.io Dashboard

**Access**: https://fly.io/dashboard/fpsgame-api

**Metrics**:
- Instance health
- Request metrics
- Deployment history
- Certificate status
- Scale status

### Vercel Analytics

**Access**: https://vercel.com/dashboard/fpsgame-xyz/analytics

**Metrics**:
- Page views
- Unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Top pages
- Top referrers

## Alerts

### Critical Alerts (Page immediately)

**Backend Down**:
```yaml
alert: BackendDown
expr: up{job="fpsgame-api"} == 0
for: 2m
severity: critical
action: Page on-call engineer
```

**High Error Rate**:
```yaml
alert: HighErrorRate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
for: 5m
severity: critical
action: Page on-call engineer
```

**Database Unreachable**:
```yaml
alert: DatabaseDown
expr: up{job="postgres"} == 0
for: 2m
severity: critical
action: Page on-call engineer
```

### Warning Alerts (Notify Slack)

**High Latency**:
```yaml
alert: HighLatency
expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1.0
for: 10m
severity: warning
action: Notify #alerts channel
```

**High Memory Usage**:
```yaml
alert: HighMemoryUsage
expr: (process_resident_memory_bytes / 512000000) > 0.85
for: 10m
severity: warning
action: Notify #alerts channel
```

**WebSocket Connection Drop**:
```yaml
alert: WebSocketConnectionDrop
expr: rate(websocket_events_total{event="disconnect"}[5m]) > 10
for: 5m
severity: warning
action: Notify #alerts channel
```

## Uptime Monitoring

### External Monitoring Services

**Recommended**: Better Stack (BetterUptime) or UptimeRobot

**Endpoints to Monitor**:

1. **Frontend** (https://fpsgame-xyz.vercel.app)
   - Check: HTTP 200
   - Interval: 60 seconds
   - Locations: Multiple regions

2. **Backend Health** (https://fpsgame-api.fly.dev/healthz)
   - Check: HTTP 200, response contains "healthy"
   - Interval: 30 seconds
   - Locations: Same regions as backend

3. **Backend Readiness** (https://fpsgame-api.fly.dev/readyz)
   - Check: HTTP 200, response contains "ready"
   - Interval: 60 seconds

4. **WebSocket** (wss://fpsgame-api.fly.dev/ws)
   - Check: Connection succeeds, receives heartbeat
   - Interval: 120 seconds

### BetterUptime Setup

```bash
# 1. Create account at betteruptime.com
# 2. Add monitors via dashboard or API:

curl -X POST https://betteruptime.com/api/v2/monitors \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monitor": {
      "url": "https://fpsgame-api.fly.dev/healthz",
      "monitor_type": "status",
      "check_frequency": 30,
      "regions": ["us", "eu", "as"]
    }
  }'
```

## Log Analysis

### Searching Logs

**Fly.io**:
```bash
# Recent errors
fly logs -a fpsgame-api | grep ERROR

# Specific player
fly logs -a fpsgame-api | grep "playerId:player_123"

# WebSocket issues
fly logs -a fpsgame-api | grep -i websocket

# Request tracing
fly logs -a fpsgame-api | grep "requestId:abc-123"
```

**With Logtail**:
- Use dashboard query builder
- Filter by level, timestamp, custom fields
- Create saved searches

### Common Log Patterns

**Authentication Failures**:
```json
{
  "level": "warn",
  "msg": "Authentication failed",
  "playerId": "player_123",
  "reason": "invalid_token"
}
```

**Rate Limit Exceeded**:
```json
{
  "level": "warn",
  "msg": "Rate limit exceeded",
  "ip": "1.2.3.4",
  "endpoint": "/ws"
}
```

**Match Events**:
```json
{
  "level": "info",
  "msg": "Match completed",
  "matchId": "match_456",
  "duration": 600,
  "players": 12
}
```

## Performance Monitoring

### Frontend (Real User Monitoring)

**Vercel Analytics**:
- Automatically tracks Core Web Vitals
- No code changes required
- View in Vercel dashboard

**Custom Analytics**:
```javascript
// Track custom events
window.analytics?.track('match_started', {
  matchId: 'match_123',
  mode: 'tdm',
  map: 'arena_hub'
});
```

### Backend (APM)

**Options**:
- Prometheus + Grafana (self-hosted)
- Datadog APM
- New Relic APM

**Metrics to Track**:
- Request throughput (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Database query performance
- Redis operation latency

## Debugging

### Request Tracing

**Add request ID to logs**:
```javascript
// Middleware adds X-Request-ID header
const requestId = req.headers['x-request-id'] || generateId();
res.setHeader('X-Request-ID', requestId);
```

**Trace request through logs**:
```bash
fly logs -a fpsgame-api | grep "requestId:abc-123"
```

### Performance Profiling

**Node.js CPU Profiling**:
```bash
# SSH into instance
fly ssh console -a fpsgame-api

# Start with profiling enabled
node --prof server/index.js

# Generate profile report
node --prof-process isolate-*.log > profile.txt
```

**Memory Leak Detection**:
```bash
# Take heap snapshot
fly ssh console -a fpsgame-api
node --inspect server/index.js

# Connect Chrome DevTools
# chrome://inspect
```

## Security Monitoring

### Failed Authentication Attempts

**Alert on suspicious patterns**:
```yaml
alert: HighAuthFailureRate
expr: rate(auth_failures_total[5m]) > 10
for: 5m
severity: warning
action: Review logs for potential attack
```

### Rate Limit Events

**Track rate limiting**:
```bash
# Count rate limit events
fly logs -a fpsgame-api | grep "Rate limit exceeded" | wc -l

# Group by IP
fly logs -a fpsgame-api | grep "Rate limit exceeded" | grep -oP 'ip:\K[\d.]+' | sort | uniq -c | sort -rn
```

## Monitoring Checklist

### Daily
- [ ] Check dashboard for anomalies
- [ ] Review error rate
- [ ] Check uptime monitors (all green)
- [ ] Review deployment status

### Weekly
- [ ] Review metrics trends
- [ ] Check for slow queries
- [ ] Review security logs
- [ ] Update runbooks if needed

### Monthly
- [ ] Review and optimize alert thresholds
- [ ] Capacity planning based on growth
- [ ] Update monitoring documentation
- [ ] Test incident response procedures

## Tools and Resources

### Monitoring Tools
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Better Stack**: Uptime monitoring and status page
- **Sentry**: Error tracking (optional)
- **Logtail**: Log aggregation (optional)

### Setup Scripts

**Install monitoring stack** (optional self-hosted):
```bash
# Docker Compose for Prometheus + Grafana
docker-compose -f monitoring/docker-compose.yml up -d
```

**Configure Prometheus** (prometheus.yml):
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fpsgame-api'
    static_configs:
      - targets: ['fpsgame-api.fly.dev:443']
    scheme: https
    metrics_path: '/metrics'
```

## Support Contacts

- **Fly.io Support**: https://community.fly.io
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs/support
- **Upstash Support**: https://upstash.com/docs/support

## Related Documentation

- [Deployment Guide](./README.md)
- [Runbooks](./runbooks.md)
- [Environments](./environments.md)
