# Arena Blitz FPS - Multiplayer Server

## Overview

This is the multiplayer server for Arena Blitz FPS, implementing secure, low-latency, server-authoritative networking with client-side prediction, lag compensation, and anti-cheat validation.

## Architecture

### Server Components

- **`index.js`** - Main server bootstrap with WebSocket handling, room management, and heartbeats
- **`rooms/`** - Room and lobby systems
  - `Room.js` - Authoritative game room with tick loop and snapshot generation
  - `Lobby.js` - Matchmaking queue with MMR-based matching
- **`systems/`** - Game logic systems
  - `Movement.js` - Server-side movement validation and reconciliation
  - `Combat.js` - Hit registration with lag compensation (rewind to client timestamp)
  - `Spawn.js` - Safe spawn point selection
  - `Match.js` - Game mode rules (TDM, FFA, KoTH) and scoring
- **`auth/`** - Authentication
  - `Auth.js` - JWT token validation and rate limiting
- **`economy/`** - Shop and economy
  - `Shop.js` - Purchase validation, shop rotation, currency management
- **`antiCheat/`** - Anti-cheat systems
  - `Detectors.js` - Speed hacks, fire rate, impossible angles detection
- **`protocol/`** - Network protocol
  - `Schema.js` - Binary message encoding with MessagePack
- **`persistence/`** - Data storage
  - `PlayerData.js` - In-memory player data with DB interface stubs

### Client Components (in `src/networking/`)

- **`NetworkManager.js`** - Main coordinator integrating all systems
- **`Client.js`** - WebSocket client with auto-reconnection
- **`Prediction.js`** - Client-side prediction for responsive movement
- **`Reconciliation.js`** - State reconciliation with server corrections
- **`InterpolationBuffer.js`** - Smooth interpolation for remote entities
- **`ProtocolClient.js`** - Client-side message encoding/decoding
- **`NetEvents.js`** - Event bridge for gameplay/UI integration

## Running the Server

### Start Server
```bash
npm run server
```

### Start Server with Auto-reload (Development)
```bash
npm run server:dev
```

The server will start on port 3001 by default. You can change this with the `PORT` environment variable:

```bash
PORT=8080 npm run server
```

## Network Protocol

### Binary Encoding
Messages are encoded using MessagePack for efficient bandwidth usage (50-100 kbps per client target).

### Message Types

**Client → Server:**
- `JOIN` - Join server with session token
- `INPUT` - Player input (60Hz)
- `FIRE` - Fire weapon (30Hz max)
- `SHOP_PURCHASE` - Purchase item
- `EQUIP_LOADOUT` - Change loadout
- `HEARTBEAT` - Keep-alive (1Hz)

**Server → Client:**
- `JOINED` - Successfully joined room
- `SNAPSHOT` - World state (20-30Hz)
- `EVENT` - Game events (kills, hits, score)
- `RECONCILE` - State correction
- `SHOP_INVENTORY` - Shop rotation
- `ECONOMY_UPDATE` - Currency/inventory update
- `ERROR` - Error message

## Features

### Client-Side Prediction
- Players predict their own movement locally
- Inputs sent to server with sequence numbers
- Server acknowledges processed inputs
- Client reconciles on mismatch (smooth corrections)

### Lag Compensation
- Server maintains 250ms history of entity transforms
- On fire events, rewind to client timestamp
- Perform hit detection on historical state
- Validates line-of-sight and weapon constraints

### Anti-Cheat
- Movement speed validation
- Fire rate validation (RPM limits)
- Impossible aim speed detection
- Teleport detection
- Ammo validation
- Packet sequence validation

### Matchmaking
- MMR-based matching (from `docs/ranked_mmr.md`)
- Region selection (NA, EU, Asia, Auto)
- MMR range expands with wait time:
  - 0-60s: ±100 MMR
  - 60-120s: ±150 MMR
  - 120-180s: ±200 MMR
  - 180s+: ±250 MMR
- Team balancing (snake draft by MMR)

### Shop & Economy
- Purchase validation against `data/economy/shop_inventory.json`
- Price validation (prevents client manipulation)
- Currency management (credits, gems)
- Daily shop rotation
- Bundle support with discounts

## Performance

### Target Metrics
- **Server tick rate**: 30Hz
- **Snapshot rate**: 20-30Hz
- **Client input rate**: 60Hz
- **Interpolation buffer**: 100ms
- **Bandwidth**: 50-100 kbps per client in combat
- **Latency support**: Fair gameplay at 50-150ms RTT

### Optimization
- Binary protocol with MessagePack
- Delta compression (planned)
- Interest management (planned)
- Bandwidth throttling per client

## Testing

### Network Test Page
Open `test-network.html` in a browser while the server is running to:
- Test connection
- Monitor latency
- Send test inputs and fire events
- View network logs

### Manual Testing
```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client (Vite dev server)
npm run dev

# Open browser to http://localhost:5173/test-network.html
```

## Configuration

### Server Configuration
Edit values in `server/index.js`:
- `PORT` - Server port (default: 3001)
- `HEARTBEAT_INTERVAL` - Heartbeat interval in ms
- `HEARTBEAT_TIMEOUT` - Timeout before disconnect

### Room Configuration
Edit defaults in `server/rooms/Room.js`:
- `tickRate` - Server tick rate (default: 30Hz)
- `snapshotRate` - Snapshot send rate (default: 20Hz)
- `maxPlayers` - Max players per room (default: 12)

### Game Mode Configuration
Edit in `server/systems/Match.js`:
- `scoreLimit` - Score to win
- `timeLimit` - Match time limit in seconds
- `respawnDelay` - Respawn delay in ms

## Security

### Authentication
- JWT tokens with expiration
- Session validation
- Rate limiting per IP
- Connection rate limits

### Anti-Cheat
- Server authoritative (client never trusted)
- Movement validation
- Fire rate validation
- Ammo validation
- Suspicious activity logging

### Future Security
- WSS (WebSocket Secure) support ready
- Proper secret management (environment variables)
- IP-based rate limiting
- Ban system (stubs in place)

## Future Improvements

- [ ] Delta compression for snapshots
- [ ] Interest management (only send nearby entities)
- [ ] Dedicated database integration
- [ ] Replay system
- [ ] Spectator mode
- [ ] Party system
- [ ] Voice chat integration
- [ ] Admin dashboard
- [ ] Analytics pipeline
- [ ] Kubernetes deployment

## Troubleshooting

### Server won't start
- Check port 3001 is available
- Verify all dependencies: `npm install`
- Check for syntax errors: `node --check server/index.js`

### Client can't connect
- Ensure server is running
- Check WebSocket URL in client
- Verify firewall allows WebSocket connections
- Check browser console for errors

### High latency
- Check network connection
- Verify server location (region)
- Monitor server load
- Adjust interpolation buffer if needed

### Prediction errors
- Check for packet loss
- Verify tick rate stability
- Monitor reconciliation frequency
- Adjust smoothing parameters

## Contributing

When modifying the networking code:
1. Test with multiple clients
2. Test with artificial latency (100-200ms)
3. Test with packet loss
4. Verify bandwidth stays under target
5. Check for memory leaks
6. Test reconnection scenarios

## License

See main repository LICENSE file.
