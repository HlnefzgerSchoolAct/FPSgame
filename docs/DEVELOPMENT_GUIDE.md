# FPS Game - Development Guide

Technical documentation for developers working on the FPS game project.

## Architecture Overview

The game follows a modular architecture with separate systems that communicate through a central game engine.

### Core Systems

1. **Game Engine** (`engine.js`)
   - Main game loop using `requestAnimationFrame`
   - Coordinates all game systems
   - Handles rendering and updates
   - Manages game state transitions

2. **Rendering System** (Part of `engine.js`)
   - Raycasting-based 3D renderer
   - Wolfenstein 3D-style approach
   - 2.5D graphics (no vertical look in rendering, only in aiming)
   - Sprites for enemies

3. **Player System** (`player.js`)
   - First-person controls
   - Movement physics with collision
   - Input handling (keyboard and mouse)
   - Health management

4. **Weapon System** (`weapon.js`)
   - Multiple weapon types
   - Fire rate and reload mechanics
   - Raycasting for hit detection
   - Ammo management

5. **Enemy System** (`enemy.js`)
   - AI state machine (idle, chase, attack)
   - Pathfinding (direct line to player)
   - Combat mechanics
   - Spawn management

6. **Level System** (`level.js`)
   - Grid-based map
   - Collision detection
   - Raycasting for rendering
   - Spawn point management

7. **UI System** (`ui.js`)
   - HUD elements
   - Menus
   - Settings
   - Game state displays

8. **Audio System** (`audio.js`)
   - Web Audio API integration
   - Procedural sound generation
   - Volume controls

9. **Particle System** (`particles.js`)
   - Visual effects
   - Blood splatter
   - Bullet impacts

10. **Game State** (`gamestate.js`)
    - Score tracking
    - Wave management
    - Statistics

## Rendering System

### Raycasting Algorithm

The game uses a DDA (Digital Differential Analysis) raycasting algorithm inspired by Wolfenstein 3D:

```javascript
// For each vertical strip of the screen:
1. Calculate ray direction from player
2. Step through grid cells
3. Check for wall collision
4. Calculate distance to wall
5. Calculate wall height based on distance
6. Draw vertical strip with proper shading
```

### Field of View

- FOV: 60 degrees (π/3 radians)
- Number of rays: 120 (one per vertical strip)
- Renders from left to right across screen

### Distance Correction

To prevent fish-eye distortion:
```javascript
correctedDistance = actualDistance * cos(rayAngle - playerAngle)
```

### Shading

- Distance-based brightness
- Different brightness for different wall sides
- Ceiling and floor use solid colors

## Game Loop

The game loop runs at 60 FPS using `requestAnimationFrame`:

```javascript
gameLoop(timestamp) {
  1. Calculate deltaTime
  2. Update all systems
  3. Render frame
  4. Request next frame
}
```

### Delta Time

Used for frame-independent movement:
```javascript
position += velocity * deltaTime
```

## Player Controls

### Movement

- **WASD**: Directional movement relative to camera
- **Shift**: Sprint multiplier (1.7x)
- **Ctrl**: Crouch (reduces height and speed)
- **Space**: Jump with gravity

### Mouse Look

- Uses Pointer Lock API
- Horizontal rotation (yaw): Full 360°
- Vertical rotation (pitch): Clamped to ±90°
- Sensitivity: Adjustable

### Collision Detection

Player uses circle collision with radius 0.3:
```javascript
// Check 4 corners of bounding box
checkCollision(x, z, radius) {
  for each corner:
    if corner is in wall:
      return collision
}
```

## Weapon System

### Weapon Properties

Each weapon has:
- Damage per shot
- Fire rate (rounds per minute)
- Magazine size
- Max ammo
- Reload time
- Spread (accuracy)
- Recoil
- Projectiles per shot (for shotgun)

### Fire Rate Limiting

```javascript
fireDelay = 60 / fireRate
canShoot = (currentTime - lastShotTime) >= fireDelay
```

### Hit Detection

Uses raycasting from camera position in aim direction:
```javascript
1. Cast ray from player
2. Apply weapon spread
3. Check intersection with enemies
4. Check intersection with walls
5. Apply damage or spawn particles
```

## Enemy AI

### State Machine

```
IDLE → detects player → CHASE
CHASE → in range → ATTACK
ATTACK → out of range → CHASE
CHASE → far away → IDLE
any state → killed → DEAD
```

### Pathfinding

Simple direct-line approach:
```javascript
1. Calculate direction vector to player
2. Normalize direction
3. Apply move speed
4. Handle wall collisions (sliding)
```

### Combat

- Accuracy decreases with distance
- Fire rate limits shots per second
- Damage dealt to player on hit

### Difficulty Scaling

Enemies scale with wave number:
```javascript
health *= (1 + wave * 0.1)
damage *= (1 + wave * 0.1)
```

## Level Design

### Map Format

Grid-based 2D array:
- `0` = Empty space
- `1` = Wall
- `2` = Enemy spawn point (converted to 0 after reading)

### Collision System

- Uses grid-based lookup
- Fast point-in-cell checks
- Circle-rectangle collision for player

### Raycasting for Hit Detection

Separate from rendering raycasting:
- Returns hit point in 3D space
- Used for weapon shooting
- Max distance limit

## UI System

### HUD Elements

All positioned with CSS `position: absolute`:
- Health bar (bottom-left)
- Ammo counter (bottom-right)
- Weapon name (bottom-right)
- Score/kills/wave (top-right)
- Crosshair (center)
- FPS counter (top-left)

### Menus

Overlay menus with blur/darken effect:
- Main menu
- Pause menu
- Game over screen
- Settings
- Controls

### Event Handling

UI buttons connect to game engine methods:
```javascript
button.addEventListener('click', () => {
  gameInstance.method();
});
```

## Audio System

### Web Audio API

Generates sounds procedurally using oscillators:

```javascript
// Example: Shoot sound
oscillator.frequency = 200
oscillator.type = 'sawtooth'
duration = 0.1s
```

### Sound Types

- **Shoot**: Short sawtooth wave
- **Reload**: Descending square wave
- **Hit**: Brief sine wave
- **Enemy Death**: Descending sawtooth
- **Player Damage**: Low sine wave

### Volume Control

Three-tier volume system:
- Master volume
- SFX volume
- Music volume (for future use)

## Particle System

### Particle Properties

- Position (x, y, z)
- Velocity (x, y, z)
- Color
- Lifetime
- Size
- Gravity

### Effect Types

- **Blood**: Red, many particles, fall with gravity
- **Impact**: Gray, few particles, short lifetime

### Object Pooling

Limited to 500 particles:
- Oldest particles removed first
- Reuses particle objects

## Game State Management

### States

- `menu`: Main menu, not playing
- `playing`: Active gameplay
- `paused`: Game paused
- `gameover`: Player died

### Wave System

- New wave every 30 seconds
- Enemies scale with wave
- Score multiplier per wave

### Statistics

Tracked during gameplay:
- Score (kills × 100 × wave)
- Kills
- Shots fired / hits
- Accuracy percentage

## Performance Optimization

### Current Optimizations

1. **Raycasting**: Limited to 120 rays per frame
2. **Enemy AI**: Updates at 10Hz instead of 60Hz
3. **Particle Limit**: Max 500 particles
4. **Distance Culling**: Render distance limit
5. **Delta Time**: Frame-independent updates

### Performance Targets

- 60 FPS on mid-range hardware
- < 100ms frame time
- Smooth gameplay with 10+ enemies

### Profiling

FPS counter in top-left:
```javascript
Performance.fps // Current FPS
Performance.update() // Call once per frame
```

## Code Style

### Naming Conventions

- Classes: PascalCase (`GameEngine`)
- Functions: camelCase (`updatePlayer`)
- Constants: UPPER_SNAKE_CASE (`WEAPONS`)
- Private properties: No prefix (rely on closures if needed)

### Structure

- Each system in separate file
- Clear separation of concerns
- Minimal coupling between systems
- Engine as central coordinator

### Comments

- Document complex algorithms
- Explain non-obvious behavior
- Avoid redundant comments

## Testing

### Manual Testing

1. Movement and collision
2. Shooting and hit detection
3. Enemy AI behavior
4. UI responsiveness
5. Performance (FPS)

### Browser Testing

Test on:
- Chrome (primary)
- Firefox
- Safari
- Edge

### Performance Testing

- Monitor FPS counter
- Test with 10+ enemies
- Test extended play sessions
- Check for memory leaks

## Extending the Game

### Adding New Weapons

1. Define weapon config in `WEAPONS` object
2. Add to WeaponManager initialization
3. Create weapon switching keybind
4. Test balance

### Adding New Enemies

1. Create enemy subclass or variant
2. Define in `enemy.js`
3. Modify spawn logic
4. Add to wave progression

### Adding New Levels

1. Create map array in `level.js`
2. Define spawn points
3. Test collision and rendering
4. Add level selection system

### Adding Textures

1. Load image assets
2. Modify raycasting to sample textures
3. Apply to walls based on map data
4. Consider performance impact

## Troubleshooting

### Common Issues

1. **Pointer Lock Fails**
   - Must be triggered by user interaction
   - Check browser permissions

2. **Audio Not Playing**
   - Web Audio requires user interaction
   - Check browser console for errors

3. **Performance Issues**
   - Reduce number of rays
   - Lower render distance
   - Limit active enemies

4. **Collision Bugs**
   - Check player radius
   - Verify map boundaries
   - Test corner cases

## Resources

### Raycasting

- [Lode's Raycasting Tutorial](https://lodev.org/cgtutor/raycasting.html)
- Wolfenstein 3D source code

### Web APIs

- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN: Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API)

### Game Development

- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Red Blob Games](https://www.redblobgames.com/)

---

For more information, see `AGENT_PROMPTS.md` for detailed implementation guidelines for each system.
