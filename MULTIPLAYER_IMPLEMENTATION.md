# Multiplayer Networking Implementation

## Summary

This document describes the complete multiplayer networking implementation for Arena Blitz FPS, including server-authoritative gameplay, client-side prediction, lag compensation, matchmaking, economy, and anti-cheat systems.

## Implementation Status

✅ **Fully Implemented**

### Server-Side Components

1. **Core Server** (`server/index.js`)
   - WebSocket server (ws library)
   - Connection management with rate limiting
   - Heartbeat system (1s interval, 5s timeout)
   - Message routing and handling
   - Periodic cleanup tasks
   - Statistics logging

2. **Room System** (`server/rooms/Room.js`)
   - Authoritative game state management
   - 30Hz server tick loop
   - 20-30Hz snapshot generation
   - Player spawn/respawn handling
   - Team assignment and balancing
   - Match lifecycle management
   - Anti-cheat integration

3. **Lobby & Matchmaking** (`server/rooms/Lobby.js`)
   - Queue system by region (NA, EU, Asia, Auto)
   - MMR-based matching (follows `docs/ranked_mmr.md`)
   - Dynamic MMR range based on wait time
   - Team balancing (snake draft)
   - Room creation and cleanup

4. **Movement System** (`server/systems/Movement.js`)
   - Server-authoritative movement validation
   - Input sequence tracking
   - State reconciliation support
   - Physics simulation (gravity, acceleration, friction)
   - Collision detection (map boundaries)
   - Movement speed validation

5. **Combat System** (`server/systems/Combat.js`)
   - Lag compensation (250ms history)
   - Rewind to client timestamp for hit detection
   - Ray-cast AABB collision
   - Damage calculation (distance falloff, hitbox multipliers)
   - Line-of-sight validation
   - Fire rate validation
   - Projectile simulation

6. **Spawn System** (`server/systems/Spawn.js`)
   - Safe spawn point selection
   - Enemy proximity checks
   - Line-of-sight validation
   - Spawn cooldowns (3s)
   - Team-based spawn points
   - Score-based spawn selection

7. **Match System** (`server/systems/Match.js`)
   - Game mode support (TDM, FFA, KoTH)
   - Score tracking (team and individual)
   - Objective management (control points)
   - Win condition checking
   - Time limit enforcement
   - Player statistics tracking

8. **Authentication** (`server/auth/Auth.js`)
   - JWT token generation and validation
   - Session management
   - Guest token support
   - IP-based rate limiting
   - Ban system stubs

9. **Economy & Shop** (`server/economy/Shop.js`)
   - Purchase validation
   - Price verification
   - Currency management (credits, gems)
   - Inventory management
   - Shop rotation (24h cycle)
   - Daily deals
   - Bundle support

10. **Anti-Cheat** (`server/antiCheat/Detectors.js`)
    - Speed hack detection
    - Fire rate validation
    - Impossible aim speed detection
    - Teleport detection
    - Ammo validation
    - Packet sequence validation
    - Suspicious activity logging

11. **Protocol** (`server/protocol/Schema.js`)
    - Binary encoding with MessagePack
    - Message type enumeration
    - Action bitmasks for compact transmission
    - Validation constants (rate limits, max values)
    - Helper functions for message creation

12. **Persistence** (`server/persistence/PlayerData.js`)
    - In-memory player data storage
    - Session management
    - Currency and inventory tracking
    - Stats tracking
    - Ranked data (MMR, wins, losses)
    - Database interface stubs for future integration

### Client-Side Components

1. **Network Client** (`src/networking/Client.js`)
   - WebSocket connection management
   - Auto-reconnection with exponential backoff
   - Binary message handling (ArrayBuffer)
   - Heartbeat system
   - Latency measurement (RTT/2)
   - Connection quality metrics
   - Message queueing during reconnection

2. **Client-Side Prediction** (`src/networking/Prediction.js`)
   - Local input prediction
   - Input history management (120 inputs)
   - Physics simulation (mirrors server)
   - Movement speed calculation
   - Action handling (sprint, crouch, jump, ADS)

3. **State Reconciliation** (`src/networking/Reconciliation.js`)
   - Server state correction
   - Smooth vs snap correction modes
   - Error threshold detection
   - Input replay after correction
   - Configurable smoothing factor

4. **Interpolation Buffer** (`src/networking/InterpolationBuffer.js`)
   - 100ms buffering for remote entities
   - Smooth interpolation between snapshots
   - Position and rotation interpolation
   - Angle wrap-around handling
   - Buffer health monitoring

5. **Protocol Client** (`src/networking/ProtocolClient.js`)
   - Message encoding/decoding (mirrors server)
   - MessagePack integration for browser
   - Action bitmask creation/parsing
   - Helper functions for all message types

6. **Network Events** (`src/networking/NetEvents.js`)
   - Event-based communication bridge
   - Event listener registration
   - Game event types (kills, deaths, objectives, etc.)
   - Economy event types (purchases, inventory)
   - Connection event types

7. **Network Manager** (`src/networking/NetworkManager.js`)
   - Main coordinator for all networking
   - Integrates prediction, reconciliation, interpolation
   - Input rate limiting (60Hz)
   - Fire rate limiting (30Hz)
   - Message handler routing
   - Statistics aggregation

## Technical Specifications

### Network Protocol

**Transport:** WebSocket (upgradable to WSS)
**Encoding:** MessagePack (binary)
**Target Bandwidth:** 50-100 kbps per client in combat

### Tick Rates

- **Server simulation:** 30Hz
- **Snapshot transmission:** 20-30Hz
- **Client input:** 60Hz
- **Heartbeat:** 1Hz

### Timing & Buffering

- **Interpolation buffer:** 100ms
- **Lag compensation history:** 250ms
- **Heartbeat timeout:** 5000ms
- **Spawn cooldown:** 3000ms

### Rate Limits

- **Input messages:** 60/s per client
- **Fire messages:** 30/s per client
- **General messages:** 120/s per client
- **Connection attempts:** 10/min per IP

### Validation Thresholds

- **Max movement speed:** 15 units/s
- **Max look speed:** 4π radians/s (720°/s)
- **Reconciliation error threshold:** 0.5m
- **Position mismatch tolerance:** 50%

## Architecture Decisions

### Server Authority
- All gameplay logic runs on server
- Client predictions are validated
- Server state is authoritative
- Anti-cheat runs server-side

### Client-Side Prediction
- Immediate response to player input
- Smooth corrections on mismatch
- Input replay for reconciliation
- Minimal visual artifacts

### Lag Compensation
- Rewind entity states to client timestamp
- Fair hit registration at 50-150ms RTT
- Line-of-sight validation
- Weapon constraint validation

### Binary Protocol
- MessagePack for efficient encoding
- Bitmasks for compact actions
- Minimized bandwidth usage
- Fast serialization/deserialization

## Testing

### Manual Testing
1. Start server: `npm run server`
2. Open `test-network.html` in browser
3. Click "Connect to Server"
4. Test inputs and fire events
5. Monitor latency and connection quality

### Integration Testing
- Two clients can join and move
- Hits are registered with lag compensation
- Snapshots arrive at 20-30Hz
- Prediction is smooth
- Reconciliation corrects gently

### Performance Testing
- Bandwidth under 100 kbps per client
- Server handles 12 players per room
- Tick rate stable at 30Hz
- No memory leaks over time

## Security Considerations

### Implemented
- JWT authentication
- Session validation
- Rate limiting (IP and per-client)
- Input validation
- Anti-cheat detection
- Server authority

### Ready for Production
- WSS support (TLS)
- Environment-based secrets
- DOS protection
- Logging and monitoring hooks

### Future Enhancements
- Database-backed bans
- IP reputation system
- Advanced packet inspection
- Behavior analysis
- Admin dashboard

## Known Limitations

1. **In-Memory Storage**
   - Player data not persisted
   - Server restart loses state
   - No database integration yet

2. **Basic Matchmaking**
   - Simple MMR matching
   - No party support
   - No rank decay enforcement

3. **Collision Detection**
   - Simple AABB boxes
   - No complex map geometry
   - Basic LOS checks

4. **Anti-Cheat**
   - Detection only (no auto-ban)
   - Logging to console
   - No admin dashboard

5. **Shop System**
   - No payment processing
   - Static shop rotation
   - No promotional events

## Future Work

### Short Term
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Persistent player profiles
- [ ] Advanced collision detection
- [ ] Map-aware spawn selection
- [ ] Delta compression for snapshots

### Medium Term
- [ ] Party/group system
- [ ] Voice chat integration
- [ ] Spectator mode
- [ ] Replay recording
- [ ] Admin dashboard

### Long Term
- [ ] Cross-region play
- [ ] Tournament support
- [ ] Custom game modes
- [ ] Workshop/modding
- [ ] Mobile client support

## Deployment

### Development
```bash
npm install
npm run server
```

### Production (Example)
```bash
export PORT=8080
export JWT_SECRET=your-secret-key
export NODE_ENV=production
node server/index.js
```

### Docker (Future)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server ./server
COPY data ./data
EXPOSE 3001
CMD ["node", "server/index.js"]
```

## Dependencies

### Production
- `ws` (^8.18.0) - WebSocket server
- `msgpackr` (^1.11.0) - Binary message encoding
- `jsonwebtoken` (^9.0.2) - JWT authentication

### Development
- `three` (^0.159.0) - 3D rendering (client-side)
- `vite` (^5.0.0) - Development server

## Documentation

- **Server README:** `server/README.md`
- **Ranked MMR Design:** `docs/ranked_mmr.md`
- **Spawn System Design:** `docs/spawn_system.md`
- **Network Test Page:** `test-network.html`

## Credits

This implementation follows industry best practices from:
- Valve (Source Engine networking)
- Riot Games (Valorant netcode)
- Blizzard (Overwatch lag compensation)
- Gabriel Gambetta (Fast-Paced Multiplayer articles)

## License

See main repository LICENSE file.
