# FPS Gameplay System

This directory contains the complete FPS gameplay system implementation.

## Quick Start

```javascript
import { Game } from './Game.js';

const game = new Game();
await game.init();
game.start();
```

## Directory Structure

- **Game.js** - Main game class that integrates all systems
- **gameplay/** - Core gameplay mechanics
- **weapons/** - Weapon data loading and management
- **mechanics/** - Game mechanics (ADS, spread, spawn)
- **collision/** - Hit detection and hitboxes
- **controllers/** - Animation and input controllers

## Key Features

✅ **First-Person Movement**
- Walk, sprint, crouch, jump, slide
- Air control and slope handling
- Smooth acceleration and friction

✅ **Weapon System**
- Fire modes (auto, burst, semi)
- RPM-based fire rate limiting
- Magazine and reload system
- ADS with FOV and sensitivity changes

✅ **Recoil & Spread**
- Learnable recoil patterns from JSON
- Spread bloom and decay
- Movement and ADS penalties
- Pattern recovery over time

✅ **Hit Detection**
- Hitscan raycasting with spread
- Head/body/limb hitboxes
- Damage multipliers by zone
- Distance-based damage falloff

✅ **Health System**
- HP with optional shields
- Configurable regeneration
- Damage tracking and events

✅ **Loadout Management**
- Primary/secondary weapons
- 5 attachment slots per weapon
- Stat modification from attachments
- Validation and compatibility checks

✅ **Client-Side Prediction**
- Input buffering and replay
- Server reconciliation
- Deterministic physics

✅ **Event System**
- Input events for networking
- HUD events for UI
- Animation events for graphics

## Testing

Open `test.html` in a browser to run the test suite:

```bash
python3 -m http.server 8080
# Open http://localhost:8080/test.html
```

Or run the full game:

```bash
# Open http://localhost:8080/index.html
```

## Integration

See `docs/GAMEPLAY_API.md` for detailed API documentation.

### Networking Integration

```javascript
// Send input to server
const state = game.getPredictedState();
networkClient.send(state);

// Receive server snapshot
game.onServerReconcile(serverSnapshot);
```

### Graphics Integration

```javascript
// Listen for animation events
game.animationHooks.on('anim:muzzle:flash', (data) => {
  renderMuzzleFlash(data.position, data.direction);
});
```

### UI Integration

```javascript
// Listen for HUD updates
window.addEventListener('hud:update:ammo', (e) => {
  updateAmmoDisplay(e.detail.current, e.detail.reserve);
});
```

## Data Files

The system loads data from:
- `/data/weapons/weapons.json` - Weapon definitions
- `/data/weapons/attachments.json` - Attachment definitions
- `/balance/recoil_patterns.json` - Recoil pattern data

## Performance

- Target: 60 FPS on desktop, 30+ on mobile
- Delta time clamping prevents physics issues
- Object pooling hooks provided (implement in graphics layer)
- Event-driven architecture minimizes polling

## Controls

Default keyboard/mouse bindings:
- **WASD** - Movement
- **Mouse** - Look
- **Left Click** - Fire
- **Right Click** - ADS
- **R** - Reload
- **Q** - Switch weapon
- **Space** - Jump
- **C** - Crouch
- **Shift** - Sprint
- **Escape** - Pause

Bindings can be customized via `InputManager.rebindAction()`.

## Next Steps

1. Add 3D rendering (Three.js/Babylon.js)
2. Implement networking layer
3. Add audio system
4. Create more weapons and maps
5. Add mobile touch controls
