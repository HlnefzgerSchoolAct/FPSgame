# Production Setup Guide

This is a step-by-step guide to set up FPSgame for production deployment from scratch.

## Prerequisites

- [ ] GitHub account with access to repository
- [ ] Node.js 20+ installed locally
- [ ] Git installed
- [ ] Docker and Docker Compose installed (for local testing)

## Part 1: Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/HlnefzgerSchoolAct/FPSgame.git
cd FPSgame
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Secrets

```bash
npm run generate:secrets
```

Save the generated secrets somewhere safe (password manager, secure notes).

### 4. Configure Local Environment

```bash
cp .env.example .env
```

Edit `.env` with development values:
```env
VITE_PUBLIC_API_ORIGIN=http://localhost:3001
VITE_PUBLIC_WSS_URL=ws://localhost:3001
NODE_ENV=development
PORT=3001
```

### 5. Test Local Build

```bash
# Build frontend
npm run build

# Start backend
npm run server

# In another terminal, test
curl http://localhost:3001/healthz
```

### 6. Test with Docker (Optional)

```bash
# Start full stack
docker-compose up

# Test health
curl http://localhost:3001/healthz

# Stop stack
docker-compose down
```

## Part 2: Service Account Setup

### 1. Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Verify email address

### 2. Fly.io Account

1. Go to [fly.io](https://fly.io)
2. Sign up with GitHub or email
3. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
4. Login:
   ```bash
   fly auth login
   ```

### 3. Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub account
3. Verify email address

### 4. Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub or email
3. Verify email address

## Part 3: Provision Backend Services

### 1. Create PostgreSQL Database (Neon)

1. Login to [console.neon.tech](https://console.neon.tech)
2. Click "Create Project"
   - Name: `fpsgame-production`
   - Region: Choose closest to your target users (e.g., `US East (Ohio)`)
   - Postgres version: 16 (recommended)
3. Wait for provisioning (~30 seconds)
4. Copy connection string:
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Save as `DATABASE_URL`

**Example**:
```
postgresql://fpsgame_owner:AbCdEf123@ep-xyz-123.us-east-2.aws.neon.tech/fpsgame?sslmode=require
```

### 2. Create Redis Cache (Upstash)

1. Login to [console.upstash.com](https://console.upstash.com)
2. Click "Create Database"
   - Name: `fpsgame-redis`
   - Type: Regional
   - Region: Same as Neon database
   - TLS: Enabled
3. Wait for creation (~10 seconds)
4. Copy connection string:
   - Click "Connect" → "Redis Clients"
   - Copy the connection string starting with `redis://` or `rediss://`
   - Save as `REDIS_URL`

**Example**:
```
rediss://default:AbCdEf123@us1-xyz-123.upstash.io:6379
```

### 3. Create Backend App (Fly.io)

1. Create app:
   ```bash
   fly apps create fpsgame-api
   ```
   
   Note: If name is taken, try `fpsgame-api-prod` or append random string.

2. Set all secrets:
   ```bash
   fly secrets set \
     DATABASE_URL="postgresql://..." \
     REDIS_URL="rediss://..." \
     JWT_SECRET="<from generate-secrets>" \
     SHOP_SIGNING_KEY="<from generate-secrets>" \
     PUBLIC_ORIGIN="https://fpsgame-api.fly.dev" \
     ALLOWED_ORIGINS="https://fpsgame-api.fly.dev" \
     -a fpsgame-api
   ```
   
   **Important**: Replace placeholders with actual values!

3. Deploy backend:
   ```bash
   fly deploy -a fpsgame-api
   ```
   
   This will:
   - Build Docker image
   - Deploy to Fly.io
   - Assign public URL: `https://fpsgame-api.fly.dev`

4. Verify deployment:
   ```bash
   # Check status
   fly status -a fpsgame-api
   
   # Test health endpoint
   curl https://fpsgame-api.fly.dev/healthz
   
   # View logs
   fly logs -a fpsgame-api
   ```

5. Note your backend URL:
   - API: `https://fpsgame-api.fly.dev`
   - WebSocket: `wss://fpsgame-api.fly.dev/ws`

## Part 4: Provision Frontend (Vercel)

### 1. Import Repository

1. Login to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import from GitHub:
   - Click "Import" next to `HlnefzgerSchoolAct/FPSgame`
   - If not visible, click "Add GitHub Account" and authorize Vercel

### 2. Configure Project

**Framework Preset**: Vite (auto-detected)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

**Root Directory**: `./` (leave blank)

### 3. Add Environment Variables

Click "Environment Variables" and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_PUBLIC_API_ORIGIN` | `https://fpsgame-api.fly.dev` | Production, Preview |
| `VITE_PUBLIC_WSS_URL` | `wss://fpsgame-api.fly.dev/ws` | Production, Preview |
| `VITE_BUILD_ENV` | `production` | Production |
| `VITE_BUILD_ENV` | `preview` | Preview |

### 4. Deploy

1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Note your deployment URL: `https://fpsgame-xyz.vercel.app`

### 5. Update Backend CORS

Now that you have the frontend URL, update backend:

```bash
fly secrets set \
  PUBLIC_ORIGIN="https://fpsgame-xyz.vercel.app" \
  ALLOWED_ORIGINS="https://fpsgame-xyz.vercel.app" \
  -a fpsgame-api
```

This will trigger a re-deploy of the backend.

## Part 5: Setup CI/CD

### 1. Get Vercel Tokens

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
   - Name: `GitHub Actions`
   - Scope: Full Account
   - Expiration: No expiration
3. Copy token (save as `VERCEL_TOKEN`)

4. Get Organization ID:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Link project (run in repo directory)
   vercel link
   
   # Get IDs
   cat .vercel/project.json
   ```
   
   Save:
   - `orgId` as `VERCEL_ORG_ID`
   - `projectId` as `VERCEL_PROJECT_ID`

### 2. Get Fly.io Token

```bash
fly tokens create deploy -x 999999h
```

Save as `FLY_API_TOKEN`.

### 3. Add GitHub Secrets

1. Go to repository: `https://github.com/HlnefzgerSchoolAct/FPSgame/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `FLY_API_TOKEN`
   - `VITE_PUBLIC_API_ORIGIN` (your Fly.io URL)
   - `VITE_PUBLIC_WSS_URL` (your Fly.io WSS URL)

### 4. Test CI/CD

1. Make a small change (e.g., edit README)
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test CI/CD"
   git push origin main
   ```
3. Watch GitHub Actions: `https://github.com/HlnefzgerSchoolAct/FPSgame/actions`
4. Verify:
   - CI passes
   - Frontend deploys to Vercel
   - Backend deploys to Fly.io

## Part 6: Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://fpsgame-api.fly.dev/healthz

# Backend readiness
curl https://fpsgame-api.fly.dev/readyz

# Frontend (should return HTML)
curl https://fpsgame-xyz.vercel.app
```

### 2. WebSocket Test

```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c wss://fpsgame-api.fly.dev/ws
```

You should see connection established. Type `Ctrl+C` to exit.

### 3. End-to-End Test

1. Open `https://fpsgame-xyz.vercel.app` in browser
2. Open browser console (F12)
3. Click "Play" or "Join Game"
4. Verify no errors in console
5. Check WebSocket connection is established

### 4. Multi-Player Test

1. Open frontend URL in two browser windows/tabs
2. Join game in both
3. Verify both players see each other
4. Test movement, shooting, respawn
5. Complete match and verify rewards

## Part 7: Setup Monitoring (Optional)

### 1. Better Stack (Uptime Monitoring)

1. Go to [betterstack.com](https://betterstack.com)
2. Sign up for free tier
3. Add monitors:
   - Frontend: `https://fpsgame-xyz.vercel.app`
   - Backend Health: `https://fpsgame-api.fly.dev/healthz`
   - Backend Readiness: `https://fpsgame-api.fly.dev/readyz`

### 2. Prometheus + Grafana (Optional)

See [monitoring.md](./monitoring.md) for detailed setup.

## Part 8: DNS Setup (Optional)

### 1. Register Domain

Register a domain (e.g., `fpsgame.com`) with:
- Namecheap
- Google Domains
- Cloudflare Registrar

### 2. Configure Cloudflare

1. Add site to Cloudflare
2. Update nameservers at registrar
3. Add DNS records:
   ```
   play.fpsgame.com → CNAME → cname.vercel-dns.com
   api.fpsgame.com  → CNAME → fpsgame-api.fly.dev
   ```

### 3. Configure Custom Domains

**Vercel**:
1. Project Settings → Domains
2. Add `play.fpsgame.com`
3. Verify DNS

**Fly.io**:
```bash
fly certs add api.fpsgame.com -a fpsgame-api
```

### 4. Update Environment Variables

Update all URLs to use custom domains:
- Frontend: `https://play.fpsgame.com`
- Backend: `https://api.fpsgame.com`
- WebSocket: `wss://api.fpsgame.com/ws`

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
fly logs -a fpsgame-api

# Check secrets are set
fly secrets list -a fpsgame-api

# SSH into instance
fly ssh console -a fpsgame-api
```

### Frontend Build Fails

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Build command incorrect
# - Dependencies not installing
```

### WebSocket Connection Fails

1. Check browser console for errors
2. Verify WebSocket URL is correct (wss://, not ws://)
3. Check CORS configuration in backend
4. Test with wscat directly

### Database Connection Fails

1. Verify DATABASE_URL is correct
2. Check SSL mode: `?sslmode=require`
3. Test connection from Fly.io console:
   ```bash
   fly ssh console -a fpsgame-api
   psql $DATABASE_URL -c "SELECT 1"
   ```

## Next Steps

- [x] Production deployment complete ✅
- [ ] Setup monitoring and alerts
- [ ] Configure custom domain
- [ ] Run load testing
- [ ] Document incident response procedures
- [ ] Train team on operational procedures

## Support

- **Documentation**: [Deploy README](./README.md)
- **GitHub Issues**: https://github.com/HlnefzgerSchoolAct/FPSgame/issues
- **Fly.io Community**: https://community.fly.io
- **Vercel Support**: https://vercel.com/support

## Checklist

Use this checklist to track your progress:

- [ ] Local development working
- [ ] Secrets generated and stored safely
- [ ] Neon PostgreSQL database created
- [ ] Upstash Redis created
- [ ] Fly.io app created and deployed
- [ ] Vercel project imported and deployed
- [ ] Backend CORS updated with frontend URL
- [ ] GitHub Actions secrets configured
- [ ] CI/CD pipeline tested
- [ ] Health checks passing
- [ ] WebSocket connection working
- [ ] Multi-player test successful
- [ ] Monitoring setup (optional)
- [ ] Custom domain configured (optional)

**Congratulations!** 🎉 Your game is now live and playable!

Share your URLs:
- **Frontend**: https://fpsgame-xyz.vercel.app
- **Backend**: https://fpsgame-api.fly.dev
