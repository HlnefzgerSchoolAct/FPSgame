# ========================================
# Multi-stage Dockerfile for FPSgame Backend
# ========================================
# This creates an optimized production image for the Node.js game server

# ========================================
# Stage 1: Base
# ========================================
FROM node:20-alpine AS base

# Install necessary tools
RUN apk add --no-cache \
    dumb-init \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ========================================
# Stage 2: Dependencies
# ========================================
FROM base AS dependencies

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ========================================
# Stage 3: Production
# ========================================
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=production

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy server code and data files
COPY server/ ./server/
COPY data/ ./data/
COPY balance/ ./balance/
COPY game-modes/ ./game-modes/
COPY analytics/ ./analytics/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (will be overridden by Fly.io/Render)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/healthz || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server/index.js"]
