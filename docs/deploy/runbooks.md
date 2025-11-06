# Operational Runbooks

## Overview

This document provides step-by-step procedures for common operational tasks.

## Table of Contents

- [Deployments](#deployments)
- [Rollbacks](#rollbacks)
- [Scaling](#scaling)
- [Incident Response](#incident-response)
- [Maintenance](#maintenance)

## Deployments

### Standard Deployment (via CI/CD)

**Trigger**: Push to `main` branch

**Steps**:
1. Merge PR to `main`
2. GitHub Actions automatically triggers deployment
3. Monitor deployment in Actions tab
4. Verify health checks pass
5. Test WebSocket connectivity
6. Monitor error rates for 15 minutes

**Rollback Criteria**:
- Health check failures
- Error rate > 5%
- WebSocket connection failures
- User reports of issues

### Manual Deployment

**When to use**: CI/CD failure, emergency hotfix

**Frontend (Vercel)**:
```bash
# Deploy to production
vercel --prod

# Deploy specific commit
git checkout <commit-sha>
vercel --prod
```

**Backend (Fly.io)**:
```bash
# Deploy to production
fly deploy

# Deploy specific Docker image
fly deploy --image <image-name>
```

### Database Migrations

**Before deploying schema changes**:

1. Create migration script:
```sql
-- migrations/001_add_feature.sql
ALTER TABLE players ADD COLUMN new_field VARCHAR(255);
CREATE INDEX idx_players_new_field ON players(new_field);
```

2. Test on staging database
3. Backup production database:
```bash
# Neon: Use dashboard to create backup
# Or pg_dump via Fly.io console
fly ssh console -a fpsgame-api
pg_dump $DATABASE_URL > backup.sql
```

4. Run migration:
```bash
fly ssh console -a fpsgame-api
psql $DATABASE_URL < migrations/001_add_feature.sql
```

5. Verify migration succeeded
6. Deploy application code

## Rollbacks

### Frontend Rollback

**Vercel Automatic**:
1. Go to Vercel dashboard
2. Select project
3. Click "Deployments"
4. Find previous working deployment
5. Click "..." → "Promote to Production"

**Vercel CLI**:
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

### Backend Rollback

**Automatic (in workflow)**:
```bash
# Get previous release version
fly releases -a fpsgame-api

# Rollback to specific version
fly releases rollback <version> -a fpsgame-api -y
```

**Manual**:
```bash
# Check current release
fly status -a fpsgame-api

# View release history
fly releases -a fpsgame-api

# Rollback to previous release
fly releases rollback -a fpsgame-api -y
```

### Database Rollback

**Rolling back migrations**:

1. Create rollback script:
```sql
-- migrations/001_add_feature_rollback.sql
DROP INDEX IF EXISTS idx_players_new_field;
ALTER TABLE players DROP COLUMN IF EXISTS new_field;
```

2. Test on staging
3. Apply to production:
```bash
fly ssh console -a fpsgame-api
psql $DATABASE_URL < migrations/001_add_feature_rollback.sql
```

## Scaling

### Frontend Scaling

**Vercel auto-scales globally**. No manual intervention needed.

**Monitor**:
- Vercel Analytics for traffic
- Function execution times
- Bandwidth usage

### Backend Scaling

**Vertical Scaling** (more resources per instance):

```bash
# Edit fly.toml
[vm]
  cpus = 2
  memory_mb = 1024

# Deploy changes
fly deploy
```

**Horizontal Scaling** (more instances):

```bash
# Scale to multiple regions
fly scale count 2 -a fpsgame-api

# Scale in specific regions
fly scale count 1 --region sjc -a fpsgame-api
fly scale count 1 --region iad -a fpsgame-api

# Auto-scaling (scale to zero when idle)
fly scale count 1-3 -a fpsgame-api
```

**Monitor scaling**:
```bash
fly status -a fpsgame-api
fly logs -a fpsgame-api
```

### Database Scaling

**Neon PostgreSQL**:
- Auto-scales compute automatically
- Upgrade tier in Neon dashboard if needed
- Consider read replicas for high read load

**Upstash Redis**:
- Auto-scales within tier limits
- Upgrade tier in Upstash dashboard if needed

## Incident Response

### High Error Rate

**Symptoms**: Error rate > 5%, users reporting issues

**Investigation**:
1. Check logs:
   ```bash
   fly logs -a fpsgame-api
   ```

2. Check metrics:
   ```bash
   curl https://fpsgame-api.fly.dev/metrics
   ```

3. Check health:
   ```bash
   curl https://fpsgame-api.fly.dev/healthz
   curl https://fpsgame-api.fly.dev/readyz
   ```

**Resolution**:
- If recent deploy: Rollback immediately
- If memory issue: Restart or scale up
- If database issue: Check Neon dashboard
- If external service: Wait or implement fallback

### WebSocket Disconnections

**Symptoms**: Players disconnecting frequently

**Investigation**:
1. Check connection count:
   ```bash
   curl https://fpsgame-api.fly.dev/metrics | grep websocket_connections
   ```

2. Check logs for errors:
   ```bash
   fly logs -a fpsgame-api | grep -i websocket
   ```

3. Test WebSocket directly:
   ```bash
   wscat -c wss://fpsgame-api.fly.dev/ws
   ```

**Resolution**:
- Check if Fly.io is having issues
- Verify WebSocket timeout settings
- Check for DDoS or abuse
- Scale up if under load

### Database Connection Errors

**Symptoms**: 500 errors, "connection refused" in logs

**Investigation**:
1. Check Neon dashboard for database status
2. Verify DATABASE_URL is correct:
   ```bash
   fly ssh console -a fpsgame-api
   echo $DATABASE_URL
   ```

3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

**Resolution**:
- If Neon outage: Wait and monitor
- If connection limit reached: Increase connections in Neon settings
- If SSL issue: Verify `?sslmode=require` in DATABASE_URL
- If credentials expired: Rotate in Neon and update secret

### High Memory Usage

**Symptoms**: Memory > 90%, OOM kills in logs

**Investigation**:
```bash
# Check current memory
fly status -a fpsgame-api

# Check metrics
curl https://fpsgame-api.fly.dev/metrics | grep memory
```

**Resolution**:
1. Immediate: Restart app
   ```bash
   fly apps restart fpsgame-api
   ```

2. Short-term: Scale up memory
   ```bash
   # Edit fly.toml
   memory_mb = 1024
   
   fly deploy
   ```

3. Long-term: Investigate memory leaks in code

## Maintenance

### Viewing Logs

**Real-time**:
```bash
# All logs
fly logs -a fpsgame-api

# Filter by level
fly logs -a fpsgame-api | grep ERROR

# Follow new logs
fly logs -a fpsgame-api -f
```

**Historical**: Check Fly.io dashboard or use log aggregation service (Logtail, Datadog)

### Accessing Server Console

```bash
# SSH into running instance
fly ssh console -a fpsgame-api

# Run one-off commands
fly ssh console -a fpsgame-api -C "node --version"
```

### Updating Secrets

```bash
# Update single secret
fly secrets set JWT_SECRET="new-value" -a fpsgame-api

# Update multiple secrets
fly secrets set \
  SECRET1="value1" \
  SECRET2="value2" \
  -a fpsgame-api

# View secrets (names only, not values)
fly secrets list -a fpsgame-api

# Unset secret
fly secrets unset SECRET_NAME -a fpsgame-api
```

**Note**: Setting secrets triggers a redeploy.

### Certificate Management

**Fly.io auto-manages TLS certificates**. No manual intervention needed.

**Check certificate status**:
```bash
fly certs show -a fpsgame-api
```

### Backup Procedures

**Database Backup**:
```bash
# Manual backup via Fly.io console
fly ssh console -a fpsgame-api
pg_dump $DATABASE_URL > /tmp/backup-$(date +%Y%m%d).sql

# Copy backup locally
fly ssh sftp get /tmp/backup-*.sql
```

**Neon has automatic backups**: Check dashboard for Point-in-Time Recovery options.

**Code Backup**: Git is source of truth. Ensure all changes are committed.

### Monitoring Checklist (Daily)

- [ ] Check error rates in logs
- [ ] Review deployment status
- [ ] Verify health endpoints are green
- [ ] Check Fly.io dashboard for alerts
- [ ] Monitor player count trends
- [ ] Review security scan results

### Monitoring Checklist (Weekly)

- [ ] Review CPU/memory trends
- [ ] Check database size and growth
- [ ] Review Redis usage
- [ ] Audit user-reported issues
- [ ] Review and rotate logs
- [ ] Update dependencies (`npm audit`)

### Disaster Recovery

**Complete System Failure**:

1. Assess scope (database, backend, frontend, all)
2. Check status pages (Fly.io, Neon, Vercel, Upstash)
3. Restore from backups if needed
4. Redeploy from known good commit
5. Verify health checks
6. Notify users via status page/social media

**Data Loss**:

1. Stop all writes immediately
2. Restore database from backup:
   - Neon: Use Point-in-Time Recovery in dashboard
   - Manual: Restore from pg_dump backup
3. Verify data integrity
4. Resume service
5. Post-mortem analysis

## Communication

### Internal

- Slack/Discord channel: #fpsgame-ops
- Email: ops@yourdomain.com
- On-call rotation: PagerDuty/Opsgenie

### External

- Status page: status.yourdomain.com
- Twitter: @fpsgame
- In-game notifications for major incidents

## Escalation

**Level 1** (< 5% impact):
- On-call engineer investigates
- Resolution time: 1 hour

**Level 2** (5-25% impact):
- On-call + senior engineer
- Resolution time: 30 minutes

**Level 3** (> 25% impact or total outage):
- All hands on deck
- Resolution time: immediate
- Incident commander assigned
- Hourly updates to stakeholders
