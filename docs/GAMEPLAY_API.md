# Gameplay System API Documentation

This document describes the FPS gameplay system API and integration points for networking, graphics, and UI agents.

## Overview

The gameplay system is implemented as a modular, client-side prediction-ready FPS framework using pure JavaScript with ES6 modules. It provides:

- First-person movement controller (walk, sprint, crouch, jump, slide)
- Weapon system with recoil patterns, spread, and ADS
- Hit detection with hitboxes and damage zones
- Health system with optional shields and regeneration
- Loadout management with attachment stat modifications
- Game state management
- Animation hooks for graphics integration
- Event-driven HUD updates

## Architecture

```
src/
├── Game.js                          # Main game class (entry point)
├── gameplay/                        # Core gameplay systems
│   ├── InputManager.js              # Input handling
│   ├── PlayerController.js          # Player movement
│   ├── CameraController.js          # Camera and view
│   ├── WeaponSystem.js              # Weapon mechanics
│   ├── RecoilPattern.js             # Recoil patterns
│   ├── HitDetection.js              # Raycasting
│   ├── HealthSystem.js              # HP/damage
│   ├── LoadoutManager.js            # Weapon/attachment management
│   └── GameState.js                 # State management
├── weapons/
│   └── WeaponDataLoader.js          # Load weapon data from JSON
├── mechanics/
│   ├── ADSController.js             # Aim down sights
│   ├── SpreadRecoilModel.js         # Spread calculations
│   └── SpawnSystemClient.js         # Spawn system
├── collision/
│   └── Hitboxes.js                  # Hitbox definitions
└── controllers/
    └── AnimationHooks.js            # Animation events
```

## Client-Side Prediction Interface

The `Game` class implements the standard client-side prediction interface for networking integration:

### `applyLocalInput(input, dt)`

Applies player input locally for immediate feedback.

**Parameters:**
- `input` - Input state object with:
  - `seq` - Input sequence number
  - `dt` - Delta time
  - `move` - Movement vector `{x, y, z}`
  - `look` - Look delta `{dx, dy}`
  - `actions` - Action flags `{fire, ads, reload, jump, crouch, sprint, switchWeapon}`
  - `timestamp` - Input timestamp

**Example:**
```javascript
const input = {
  seq: 123,
  dt: 0.016,
  move: { x: 0, y: 0, z: -1 },
  look: { dx: 0.01, dy: -0.005 },
  actions: {
    fire: true,
    ads: false,
    reload: false,
    jump: false,
    crouch: false,
    sprint: true
  },
  timestamp: performance.now()
};

game.applyLocalInput(input, 0.016);
```

### `getPredictedState()`

Returns the current predicted state for sending to server.

**Returns:**
```javascript
{
  position: { x, y, z },
  velocity: { x, y, z },
  rotation: { pitch, yaw },
  health: number,
  weapon: { currentAmmo, reserveAmmo, isReloading, isADS, fireMode, isEquipped },
  sequence: number
}
```

### `onServerReconcile(snapshot)`

Reconciles local prediction with authoritative server state.

**Parameters:**
- `snapshot` - Server state snapshot matching the format of `getPredictedState()`

**Example:**
```javascript
game.onServerReconcile({
  position: { x: 10.5, y: 1.8, z: -5.2 },
  velocity: { x: 0, y: 0, z: 0 },
  rotation: { pitch: 0, yaw: 1.57 },
  health: { currentHealth: 100, isAlive: true },
  weapon: { currentAmmo: 28, reserveAmmo: 90 },
  sequence: 120
});
```

## Events System

The gameplay system emits events for UI, networking, and graphics integration.

### Input Events
- `input:shoot` - Weapon fired
- `input:reload` - Reload started
- `input:switch` - Weapon switched

### Damage Events
- `hit:local` - Local hit detected
- `damage:local` - Local player took damage
- `player:death` - Player died
- `player:respawn` - Player respawned

### HUD Events
- `hud:update:ammo` - Ammo count changed
- `hud:update:health` - Health changed
- `hud:hitmarker` - Show hitmarker
- `hud:crosshair:spread` - Crosshair spread changed
- `hud:weapon:icon` - Weapon changed

### Animation Events
- `anim:muzzle:flash` - Muzzle flash
- `anim:shell:eject` - Shell ejection
- `anim:reload:start` - Reload animation start
- `anim:reload:mag:out` - Magazine removed
- `anim:reload:mag:in` - Magazine inserted
- `anim:reload:complete` - Reload complete
- `anim:equip:start` - Weapon equip start
- `anim:ads:start` - ADS start
- `anim:ads:complete` - ADS complete

**Event Listener Example:**
```javascript
window.addEventListener('input:shoot', (e) => {
  console.log('Fired weapon:', e.detail.weapon);
  console.log('Spread:', e.detail.spread);
  console.log('Recoil:', e.detail.recoil);
});

window.addEventListener('hud:update:ammo', (e) => {
  updateAmmoUI(e.detail.current, e.detail.reserve);
});

window.addEventListener('hit:local', (e) => {
  console.log('Hit target:', e.detail.targetId);
  console.log('Damage:', e.detail.damage);
  console.log('Zone:', e.detail.zone);
});
```

## Public API Methods

### Game Class

```javascript
const game = new Game();

// Initialize and load data
await game.init();

// Start game loop
game.start();

// Stop game loop
game.stop();

// Get weapon stats for UI
const weaponStats = game.getCurrentWeaponStats();
// Returns: { id, name, ammo, reserve, magSize, isReloading, isADS, fireMode, damage, rpm }

// Get crosshair state
const crosshair = game.getCrosshairState();
// Returns: { spread }

// Get health percentage
const healthPercent = game.getHealthPercent();
// Returns: 0-100
```

### LoadoutManager

```javascript
const loadout = game.loadoutManager;

// Equip weapon
loadout.equipWeapon('primary', 'ar_mk4');
loadout.equipWeapon('secondary', 'smg_phantom');

// Attach attachment
loadout.attachAttachment('primary', 'barrel', 'barrel_extended');
loadout.attachAttachment('primary', 'sight', 'sight_red_dot');

// Remove attachment
loadout.removeAttachment('primary', 'barrel');

// Switch weapon
loadout.switchToNext();
loadout.switchToSlot('secondary');

// Get current weapon with attachments applied
const weapon = loadout.getCurrentWeapon();
```

### WeaponDataLoader

```javascript
const loader = game.weaponDataLoader;

// Get weapon data
const weapon = loader.getWeapon('ar_mk4');

// Get attachment
const attachment = loader.getAttachment('barrel_extended');

// Get recoil pattern
const pattern = loader.getRecoilPattern('ar_mk4_pattern');

// Get weapon with attachments applied
const configuredWeapon = loader.getWeaponWithAttachments('ar_mk4', {
  barrel: 'barrel_extended',
  sight: 'sight_red_dot',
  magazine: 'mag_extended'
});
```

## Data Format

### Weapon Stats Application Order

1. **Base weapon stats** from `data/weapons/weapons.json`
2. **Attachment deltas** from equipped attachments
3. **ADS modifiers** (applied during gameplay)
4. **Movement modifiers** (applied during gameplay)

### Attachment Stat Modifiers

Attachments use two types of modifiers:

- **Multiplicative** (suffix `_mult`): `stat *= modifier`
- **Additive**: `stat += modifier`

**Example:**
```json
{
  "stats": {
    "falloff_range_mult": 1.15,    // 15% increase in range
    "ads_ms": 25,                   // +25ms ADS time
    "move_speed_mult": -0.02        // -2% movement speed
  }
}
```

## Performance Considerations

- **Target FPS**: 60 (desktop), 30+ (mobile)
- **Delta time clamping**: Max 33ms (30 FPS minimum)
- **Object pooling**: Recommended for bullets, tracers, impacts (implement in graphics agent)
- **Input buffering**: Last 60 inputs kept for reconciliation
- **Event throttling**: HUD updates throttled to avoid excessive redraws

## Integration Examples

### Networking Agent

```javascript
// Send input to server
const input = game._gatherInput();
networkClient.sendInput(input);

// Receive server snapshot
networkClient.on('snapshot', (snapshot) => {
  game.onServerReconcile(snapshot);
});

// Listen for local hits (send to server)
window.addEventListener('hit:local', (e) => {
  networkClient.sendHit(e.detail);
});
```

### Graphics Agent

```javascript
// Listen for animation events
game.animationHooks.on('anim:muzzle:flash', (data) => {
  spawnMuzzleFlashParticles(data.position, data.direction);
});

game.animationHooks.on('anim:shell:eject', (data) => {
  spawnShellCasing(data.position, data.weaponId);
});

// Update weapon model position/rotation based on player state
function updateWeaponGraphics() {
  const bob = game.cameraController.getBobOffset();
  const sway = game.cameraController.getSwayOffset();
  const adsProgress = game.adsController.getProgress();
  
  // Apply to 3D weapon model
  weaponModel.position.set(bob.x + sway.x, bob.y + sway.y, bob.z);
  weaponModel.fov = game.cameraController.getFOV();
}
```

### UI/UX Agent

```javascript
// Update HUD elements
window.addEventListener('hud:update:ammo', (e) => {
  document.getElementById('ammo-current').textContent = e.detail.current;
  document.getElementById('ammo-reserve').textContent = e.detail.reserve;
});

window.addEventListener('hud:update:health', (e) => {
  const healthBar = document.getElementById('health-fill');
  healthBar.style.width = e.detail.healthPercent + '%';
});

window.addEventListener('hud:hitmarker', (e) => {
  showHitmarker(e.detail.isHeadshot);
});

window.addEventListener('hud:crosshair:spread', (e) => {
  updateCrosshairSize(e.detail.spread);
});
```

## Testing

A basic test server can be started with:

```bash
cd /home/runner/work/FPSgame/FPSgame
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

### Controls

- **WASD** - Move
- **Mouse** - Look
- **Left Click** - Fire
- **Right Click** - ADS
- **R** - Reload
- **Q** - Switch weapon
- **Space** - Jump
- **C** - Crouch
- **Shift** - Sprint
- **Escape** - Pause
- **F3** - Toggle debug info

## Next Steps

1. **Graphics Integration**: Implement 3D rendering with Three.js or Babylon.js
2. **Networking Integration**: Implement WebSocket client-side prediction
3. **Audio Integration**: Add weapon sounds, footsteps, ambient audio
4. **Advanced Features**: Implement projectile physics for grenades, add more weapons
5. **Mobile Support**: Add touch controls for mobile devices

## Notes

- The system is deterministic and designed for server-authoritative networking
- All stat calculations follow the order: base → attachments → ADS → movement
- Recoil patterns are skill-based and learnable (like CS:GO)
- Hit detection is client-side with server validation expected
- Object pooling hooks are provided but not implemented (graphics agent responsibility)
