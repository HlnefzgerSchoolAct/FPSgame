# FPSgame Production Deployment Guide

This guide walks you through deploying FPSgame to production with Vercel (frontend) and Fly.io (backend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Local Development Setup](#local-development-setup)
4. [Service Provisioning](#service-provisioning)
5. [Deployment](#deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 20+ installed
- Docker and Docker Compose installed (for local testing)
- GitHub account with repository access
- Accounts on:
  - [Vercel](https://vercel.com) (frontend hosting)
  - [Fly.io](https://fly.io) (backend hosting)
  - [Neon](https://neon.tech) (PostgreSQL database)
  - [Upstash](https://upstash.com) (Redis cache)

## Architecture Overview

```
┌─────────────────┐
│   Players       │
│   (Browsers)    │
└────────┬────────┘
         │
         ├──── HTTPS ────▶ ┌──────────────────┐
         │                 │  Vercel CDN      │
         │                 │  (Frontend)      │
         │                 │  Static Assets   │
         │                 └──────────────────┘
         │
         └──── WSS/HTTPS ──▶ ┌──────────────────┐
                             │  Fly.io          │
                             │  (Backend)       │
                             │  - Game Server   │
                             │  - WebSocket     │
                             │  - Auth/Shop     │
                             └────────┬─────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
         ┌──────────▼──────────┐           ┌──────────▼──────────┐
         │  Neon PostgreSQL    │           │  Upstash Redis      │
         │  - Player Data      │           │  - Sessions         │
         │  - Inventory        │           │  - Pub/Sub          │
         │  - Shop Purchases   │           │  - Rate Limiting    │
         └─────────────────────┘           └─────────────────────┘
```

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/HlnefzgerSchoolAct/FPSgame.git
cd FPSgame
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set development values:

```env
# Frontend (Vite)
VITE_PUBLIC_API_ORIGIN=http://localhost:3001
VITE_PUBLIC_WSS_URL=ws://localhost:3001
VITE_BUILD_ENV=development

# Backend
NODE_ENV=development
PORT=3001
PUBLIC_ORIGIN=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

### 3. Start Development Stack

#### Option A: Docker Compose (Recommended)

```bash
# Start full stack (API, PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop stack
docker-compose down
```

#### Option B: Manual

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend dev server
npm run dev
```

### 4. Verify Local Setup

- Frontend: http://localhost:8080
- Backend Health: http://localhost:3001/healthz
- Backend Metrics: http://localhost:3001/metrics
- WebSocket: ws://localhost:3001/ws

## Service Provisioning

### 1. Database (Neon PostgreSQL)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project: "FPSgame"
3. Copy connection string (starts with `postgresql://`)
4. Save as `DATABASE_URL`

### 2. Cache (Upstash Redis)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create new database: "fpsgame-redis"
3. Copy connection string (starts with `redis://` or `rediss://`)
4. Save as `REDIS_URL`

### 3. Backend (Fly.io)

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Create app:
   ```bash
   fly apps create fpsgame-api
   ```

4. Set secrets:
   ```bash
   # Generate secrets
   JWT_SECRET=$(openssl rand -base64 32)
   SHOP_KEY=$(openssl rand -base64 32)
   
   # Set in Fly.io
   fly secrets set \
     DATABASE_URL="postgresql://..." \
     REDIS_URL="redis://..." \
     JWT_SECRET="$JWT_SECRET" \
     SHOP_SIGNING_KEY="$SHOP_KEY" \
     PUBLIC_ORIGIN="https://play-xyz.vercel.app" \
     ALLOWED_ORIGINS="https://play-xyz.vercel.app"
   ```

5. Deploy:
   ```bash
   fly deploy
   ```

6. Note your app URL: `https://fpsgame-api.fly.dev`

### 4. Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository: `HlnefzgerSchoolAct/FPSgame`
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Add environment variables:
   ```
   VITE_PUBLIC_API_ORIGIN=https://fpsgame-api.fly.dev
   VITE_PUBLIC_WSS_URL=wss://fpsgame-api.fly.dev/ws
   VITE_BUILD_ENV=production
   ```

5. Deploy (automatic on push to main)

6. Note your deployment URL: `https://fpsgame-xyz.vercel.app`

### 5. Update Backend CORS

Update backend with frontend URL:

```bash
fly secrets set \
  PUBLIC_ORIGIN="https://fpsgame-xyz.vercel.app" \
  ALLOWED_ORIGINS="https://fpsgame-xyz.vercel.app"
```

## Deployment

### Automated Deployment (CI/CD)

Deployments are automated via GitHub Actions:

1. **Push to `main` branch** triggers:
   - CI tests (unit, e2e, security)
   - Frontend deploy to Vercel
   - Backend deploy to Fly.io

2. **Monitor deployment**:
   - GitHub Actions: https://github.com/HlnefzgerSchoolAct/FPSgame/actions
   - Vercel Dashboard: https://vercel.com/dashboard
   - Fly.io Dashboard: https://fly.io/dashboard

### Manual Deployment

#### Frontend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Backend

```bash
# Deploy to Fly.io
fly deploy
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://fpsgame-api.fly.dev/healthz

# Backend readiness
curl https://fpsgame-api.fly.dev/readyz

# Frontend (should return HTML)
curl https://fpsgame-xyz.vercel.app
```

### 2. WebSocket Connection

```bash
# Install wscat
npm install -g wscat

# Test WebSocket
wscat -c wss://fpsgame-api.fly.dev/ws
```

### 3. End-to-End Test

1. Open frontend URL in two browser windows
2. Click "Play" to join a match
3. Verify both players spawn in the same lobby
4. Test movement, shooting, and respawn
5. Complete match and verify rewards
6. Test shop purchase
7. Equip item and rejoin match

### 4. Monitor Metrics

```bash
# View Prometheus metrics
curl https://fpsgame-api.fly.dev/metrics
```

## Troubleshooting

### Frontend Issues

**Problem**: White screen or errors in console

**Solution**:
1. Check browser console for errors
2. Verify environment variables in Vercel dashboard
3. Ensure API origin and WSS URL are correct
4. Check CORS errors (update backend ALLOWED_ORIGINS)

### Backend Issues

**Problem**: WebSocket connection fails

**Solution**:
1. Check Fly.io logs: `fly logs`
2. Verify health endpoint: `curl https://your-app.fly.dev/healthz`
3. Test WebSocket endpoint with wscat
4. Check CORS configuration in Fly secrets

**Problem**: Database connection errors

**Solution**:
1. Verify DATABASE_URL is correct
2. Check Neon dashboard for database status
3. Ensure SSL is enabled: `?sslmode=require`
4. Test connection from Fly.io console: `fly ssh console`

**Problem**: High memory usage

**Solution**:
1. Check metrics: `curl https://your-app.fly.dev/metrics`
2. Increase VM memory in `fly.toml`
3. Review logs for memory leaks
4. Restart app: `fly apps restart`

### Deployment Failures

**Problem**: GitHub Actions deploy fails

**Solution**:
1. Check Actions logs
2. Verify secrets are set correctly
3. Ensure Vercel/Fly tokens are valid
4. Test local build: `npm run build`

**Problem**: Fly.io deployment timeout

**Solution**:
1. Increase deployment timeout in workflow
2. Check Docker build logs
3. Test local Docker build: `docker build -t test .`
4. Verify Dockerfile is correct

## Next Steps

- [Environment Configuration](./environments.md)
- [Operational Runbooks](./runbooks.md)
- [Monitoring Setup](./monitoring.md)
- [Cost Estimation](./costs.md)

## Support

- GitHub Issues: https://github.com/HlnefzgerSchoolAct/FPSgame/issues
- Fly.io Community: https://community.fly.io
- Vercel Support: https://vercel.com/support
