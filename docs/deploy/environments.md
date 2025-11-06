# Environment Configuration Matrix

## Overview

This document describes all environments and their configurations.

## Environments

### Development (Local)

**Purpose**: Local development and testing

**Infrastructure**:
- Frontend: Vite dev server (localhost:8080)
- Backend: Node.js (localhost:3001)
- Database: Docker PostgreSQL or local
- Cache: Docker Redis or local

**Environment Variables**:
```env
NODE_ENV=development
VITE_BUILD_ENV=development
VITE_PUBLIC_API_ORIGIN=http://localhost:3001
VITE_PUBLIC_WSS_URL=ws://localhost:3001
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
DEBUG_MODE=true
LOG_LEVEL=debug
```

**Access**:
- No authentication required
- Mock auth available
- CORS allows localhost

### Staging (Optional)

**Purpose**: Pre-production testing

**Infrastructure**:
- Frontend: Vercel preview deployment
- Backend: Fly.io staging app
- Database: Neon staging database
- Cache: Upstash staging instance

**Environment Variables**:
```env
NODE_ENV=production
VITE_BUILD_ENV=staging
VITE_PUBLIC_API_ORIGIN=https://fpsgame-api-staging.fly.dev
VITE_PUBLIC_WSS_URL=wss://fpsgame-api-staging.fly.dev/ws
ALLOWED_ORIGINS=https://fpsgame-staging.vercel.app
DEBUG_MODE=false
LOG_LEVEL=info
```

**Access**:
- Preview URLs only
- Full authentication
- Production-like security

### Production

**Purpose**: Public game deployment

**Infrastructure**:
- Frontend: Vercel production (https://fpsgame-xyz.vercel.app)
- Backend: Fly.io production (https://fpsgame-api.fly.dev)
- Database: Neon PostgreSQL
- Cache: Upstash Redis

**Environment Variables**:
```env
NODE_ENV=production
VITE_BUILD_ENV=production
VITE_PUBLIC_API_ORIGIN=https://fpsgame-api.fly.dev
VITE_PUBLIC_WSS_URL=wss://fpsgame-api.fly.dev/ws
ALLOWED_ORIGINS=https://fpsgame-xyz.vercel.app
DEBUG_MODE=false
LOG_LEVEL=warn
ENABLE_ANTICHEAT=true
```

**Access**:
- Public URL
- Full authentication
- Rate limiting enabled
- Security headers enforced

## Secret Management

### GitHub Actions Secrets

Set in repository settings > Secrets and variables > Actions:

```
VERCEL_TOKEN          # Vercel deployment token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
FLY_API_TOKEN         # Fly.io deployment token
```

### Vercel Environment Variables

Set in Vercel project settings > Environment Variables:

```
VITE_PUBLIC_API_ORIGIN    # Backend API URL
VITE_PUBLIC_WSS_URL       # WebSocket URL
VITE_BUILD_ENV            # production/staging
```

### Fly.io Secrets

Set via CLI: `fly secrets set KEY=value`

```
DATABASE_URL              # PostgreSQL connection string
REDIS_URL                 # Redis connection string
JWT_SECRET                # JWT signing key (32+ random bytes)
SHOP_SIGNING_KEY          # Shop signature key (32+ random bytes)
PUBLIC_ORIGIN             # Frontend URL for redirects
ALLOWED_ORIGINS           # CORS allowed origins
```

### Secret Generation

Generate secure secrets:

```bash
# JWT Secret (32 bytes)
openssl rand -base64 32

# Shop Signing Key (32 bytes)
openssl rand -base64 32

# UUID (for IDs)
uuidgen
```

## Configuration Best Practices

1. **Never commit secrets**: Use `.env.example` for documentation
2. **Use environment-specific values**: Different for dev/staging/prod
3. **Rotate secrets regularly**: Especially after team changes
4. **Validate on startup**: Server should fail fast if config is invalid
5. **Document all variables**: Update `.env.example` when adding new ones

## Deployment Promotion

### Local → Staging

1. Merge to `develop` branch
2. Auto-deploy to staging (if configured)
3. Run smoke tests
4. Manual QA verification

### Staging → Production

1. Merge `develop` to `main`
2. Auto-deploy to production
3. Monitor health checks
4. Verify with end-to-end test
5. Monitor error rates for 15 minutes

## Environment Validation Checklist

Before deploying to production:

- [ ] All secrets are randomly generated (not defaults)
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] ALLOWED_ORIGINS matches actual frontend URL
- [ ] NODE_ENV=production
- [ ] DEBUG_MODE=false
- [ ] LOG_LEVEL is info or warn
- [ ] ENABLE_ANTICHEAT=true
- [ ] Health endpoints return 200
- [ ] WebSocket connection succeeds
- [ ] CORS is correctly configured
- [ ] Rate limiting is enabled
- [ ] Security headers are present

## Troubleshooting

### Environment Variable Not Working

1. Check spelling and case (variables are case-sensitive)
2. Verify variable is set in correct service (Vercel vs Fly)
3. Redeploy after changing variables
4. Check logs for startup validation errors

### CORS Errors

1. Verify ALLOWED_ORIGINS matches frontend URL exactly
2. Check for trailing slashes (should not have)
3. Ensure protocol matches (http vs https)
4. Multiple origins should be comma-separated

### WebSocket Connection Fails

1. Verify VITE_PUBLIC_WSS_URL uses `wss://` (not `ws://`)
2. Check backend logs for connection rejections
3. Verify WebSocket path matches (default: `/ws`)
4. Test with wscat: `wscat -c wss://your-backend.fly.dev/ws`
