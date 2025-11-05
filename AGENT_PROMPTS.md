# FPS Game Development - Agent Prompts

This document contains detailed prompts for 10 specialized development agents. Each prompt is self-contained and actionable, designed to guide the implementation of specific components of the FPS game.

---

## Agent 1: Core Game Engine & Architecture

### Objective
Build the foundational game engine and architecture that will serve as the backbone for the entire FPS game.

### Deliverables
1. Main game loop using `requestAnimationFrame`
2. Basic 3D rendering engine using Canvas API or WebGL
3. Modular architecture with separate modules
4. Initial HTML structure with canvas element
5. Basic camera system with first-person view

### Technical Specifications

#### File Structure
- `index.html` - Main HTML file with canvas element
- `js/engine.js` - Core game engine
- `js/main.js` - Entry point and initialization
- `js/utils.js` - Utility functions (math, vectors, etc.)
- `css/style.css` - Basic styling

#### Core Engine Features
```javascript
// Game Engine should include:
class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
  }
  
  init() {
    // Initialize canvas, context, and game systems
  }
  
  start() {
    // Start the game loop
  }
  
  gameLoop(timestamp) {
    // Main game loop using requestAnimationFrame
  }
  
  update(deltaTime) {
    // Update all game systems
  }
  
  render() {
    // Render all game objects
  }
}
```

#### Camera System
- First-person perspective
- Position (x, y, z)
- Rotation (pitch, yaw)
- Field of view (FOV)
- Projection matrix for 3D rendering

#### Rendering Approach
Choose one:
1. **Canvas 2D with raycasting** (simpler, Wolfenstein 3D style)
2. **WebGL** (full 3D, more complex)

For Canvas 2D approach:
- Implement raycasting for walls
- Draw floor and ceiling
- Render sprites for objects

For WebGL approach:
- Set up WebGL context
- Create shader programs (vertex and fragment shaders)
- Implement matrix transformations
- Set up basic lighting

### Integration Points
- Must expose methods for player, enemy, and weapon systems to hook into
- Provide event system for game state changes
- Export rendering API for other modules

### Testing Criteria
- Game loop runs at 60 FPS
- Canvas renders correctly
- Delta time calculations are accurate
- Camera rotations work smoothly
- No memory leaks in game loop

### Performance Considerations
- Use `requestAnimationFrame` for smooth rendering
- Implement delta time for frame-independent updates
- Optimize rendering to avoid unnecessary redraws
- Consider object pooling for frequently created objects

---

## Agent 2: Player Controls & Movement

### Objective
Implement responsive and smooth player controls including movement, jumping, sprinting, and crouching.

### Deliverables
1. WASD movement controls
2. Mouse look controls for camera rotation
3. Jumping and gravity physics
4. Collision detection with boundaries
5. Smooth movement with acceleration/deceleration
6. Sprint functionality (Shift key)
7. Crouch functionality (Ctrl key)

### Technical Specifications

#### File Structure
- `js/player.js` - Player class and movement logic
- `js/input.js` - Input handler for keyboard and mouse

#### Player Class
```javascript
class Player {
  constructor(x, y, z) {
    this.position = { x, y, z };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = { pitch: 0, yaw: 0 };
    this.height = 1.8; // Normal height
    this.crouchHeight = 1.2;
    this.isCrouching = false;
    this.isJumping = false;
    this.isGrounded = true;
    this.moveSpeed = 5;
    this.sprintMultiplier = 1.5;
    this.jumpForce = 8;
    this.gravity = 20;
    this.mouseSensitivity = 0.002;
  }
  
  update(deltaTime, input) {
    // Update movement
    // Apply gravity
    // Handle collisions
  }
  
  handleMovement(input, deltaTime) {
    // WASD movement logic
  }
  
  handleMouseLook(input) {
    // Mouse look logic
  }
  
  jump() {
    // Jump logic
  }
  
  crouch() {
    // Crouch logic
  }
}
```

#### Input System
```javascript
class InputHandler {
  constructor() {
    this.keys = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.isPointerLocked = false;
  }
  
  init(canvas) {
    // Set up event listeners
    // Implement pointer lock for mouse look
  }
  
  isKeyPressed(key) {
    return this.keys[key] || false;
  }
  
  getMouseDelta() {
    // Return and reset mouse movement
  }
}
```

#### Movement Features
- **WASD Movement**: Forward, left, backward, right
- **Strafing**: Simultaneous forward and side movement
- **Sprint**: Hold Shift for faster movement
- **Crouch**: Hold Ctrl to reduce height and speed
- **Jump**: Spacebar with cooldown
- **Smooth Acceleration**: Gradual speed increase/decrease
- **Friction**: Slow down when no keys pressed

#### Mouse Look
- Pointer lock API for FPS controls
- Pitch (vertical) rotation with limits (-89° to 89°)
- Yaw (horizontal) rotation (360°)
- Adjustable mouse sensitivity

#### Physics
- Gravity constant (9.8 m/s² scaled for game)
- Jump velocity calculation
- Ground detection
- Air control (limited movement while jumping)

### Integration Points
- Hook into game engine's update loop
- Access collision system from level module
- Provide position and rotation to camera
- Trigger weapon animations on movement

### Testing Criteria
- Movement feels responsive (no input lag)
- Sprinting increases speed correctly
- Crouching reduces player height
- Jump height is consistent
- Mouse look has no jitter
- Collision detection prevents walking through walls
- Smooth acceleration/deceleration

### Performance Considerations
- Cache repeated calculations
- Use normalized vectors for movement
- Limit mouse event processing rate
- Optimize collision checks

---

## Agent 3: Weapons & Shooting Mechanics

### Objective
Create a complete weapon system with multiple weapon types, shooting mechanics, ammo management, and visual effects.

### Deliverables
1. Weapon system with multiple weapon types (pistol, rifle, shotgun)
2. Shooting mechanics with raycasting for hit detection
3. Recoil and weapon spread mechanics
4. Ammo system and reload functionality
5. Crosshair display
6. Muzzle flash effects
7. Weapon switching (number keys 1-3)

### Technical Specifications

#### File Structure
- `js/weapon.js` - Weapon classes and system
- `js/projectile.js` - Bullet/projectile handling

#### Weapon System
```javascript
class Weapon {
  constructor(config) {
    this.name = config.name;
    this.damage = config.damage;
    this.fireRate = config.fireRate; // Rounds per minute
    this.magazineSize = config.magazineSize;
    this.maxAmmo = config.maxAmmo;
    this.currentAmmo = config.magazineSize;
    this.reserveAmmo = config.maxAmmo;
    this.reloadTime = config.reloadTime; // Seconds
    this.spread = config.spread; // Accuracy
    this.recoil = config.recoil;
    this.projectilesPerShot = config.projectilesPerShot || 1; // For shotgun
    this.isReloading = false;
    this.lastShotTime = 0;
  }
  
  shoot(origin, direction, callback) {
    // Shoot logic with raycasting
  }
  
  reload() {
    // Reload logic
  }
  
  canShoot() {
    // Check if weapon can shoot
  }
}

class WeaponManager {
  constructor() {
    this.weapons = [];
    this.currentWeaponIndex = 0;
  }
  
  addWeapon(weapon) {
    this.weapons.push(weapon);
  }
  
  switchWeapon(index) {
    // Switch to weapon at index
  }
  
  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }
}
```

#### Weapon Configurations
```javascript
const WEAPONS = {
  PISTOL: {
    name: 'Pistol',
    damage: 25,
    fireRate: 300, // RPM
    magazineSize: 12,
    maxAmmo: 120,
    reloadTime: 1.5,
    spread: 0.02,
    recoil: 0.05,
  },
  RIFLE: {
    name: 'Rifle',
    damage: 30,
    fireRate: 600,
    magazineSize: 30,
    maxAmmo: 180,
    reloadTime: 2.5,
    spread: 0.01,
    recoil: 0.03,
  },
  SHOTGUN: {
    name: 'Shotgun',
    damage: 15,
    fireRate: 60,
    magazineSize: 8,
    maxAmmo: 48,
    reloadTime: 3.0,
    spread: 0.15,
    recoil: 0.2,
    projectilesPerShot: 8,
  },
};
```

#### Shooting Mechanics
- **Raycasting**: Cast rays from camera for hit detection
- **Spread**: Add random offset based on weapon accuracy
- **Recoil**: Camera kick on shoot
- **Fire Rate**: Limit shots per second
- **Muzzle Flash**: Brief visual effect on shoot

#### Hit Detection
```javascript
function raycast(origin, direction, maxDistance) {
  // Cast ray and check for intersections
  // Return: { hit: true/false, point, normal, distance, entity }
}
```

#### Crosshair
- Simple cross in center of screen
- Changes color on enemy hover
- Spreads when moving/shooting
- Static when aiming

#### Visual Effects
- Muzzle flash (brief bright sprite at gun barrel)
- Bullet tracers (optional)
- Impact particles on hit
- Screen shake on shoot

### Integration Points
- Hook into input system for shoot and reload
- Access player position and camera direction
- Interface with enemy system for damage
- Trigger audio events on shoot/reload
- Update UI ammo counter

### Testing Criteria
- Weapons shoot at correct fire rate
- Ammo system works correctly
- Reload mechanic functions properly
- Hit detection is accurate
- Weapon switching is instant
- Recoil feels appropriate
- Spread affects accuracy as expected

### Performance Considerations
- Use object pooling for bullet impacts
- Limit raycast distance
- Optimize hit detection algorithm
- Throttle muzzle flash animations

---

## Agent 4: Level Design & Environment

### Objective
Create a 3D game level with walls, floors, ceilings, and environmental elements that provide an engaging play space.

### Deliverables
1. 3D game level with walls, floors, and ceilings
2. Simple map structure (procedurally generated or hard-coded)
3. Textures or colors for different surfaces
4. Obstacles and cover points
5. Lighting system (basic ambient and point lights)
6. Skybox or background

### Technical Specifications

#### File Structure
- `js/level.js` - Level class and map data
- `js/collision.js` - Collision detection system

#### Level Structure
```javascript
class Level {
  constructor() {
    this.map = [];
    this.width = 0;
    this.height = 0;
    this.cellSize = 1; // Size of each grid cell
    this.wallHeight = 3;
    this.floorColor = '#444';
    this.ceilingColor = '#111';
    this.walls = [];
    this.obstacles = [];
    this.spawnPoints = [];
  }
  
  loadMap(mapData) {
    // Load map from data
  }
  
  getCell(x, y) {
    // Get cell value at position
  }
  
  isWall(x, y) {
    // Check if cell is a wall
  }
  
  checkCollision(position, radius) {
    // Check collision with level geometry
  }
  
  render(camera) {
    // Render level geometry
  }
}
```

#### Map Data Format
```javascript
// Simple grid-based map (1 = wall, 0 = empty)
const MAP_DATA = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,1,0,0,1],
  [1,0,1,0,0,0,1,0,0,1],
  [1,0,0,0,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];
// 0 = empty, 1 = wall, 2 = obstacle/cover
```

#### Rendering Options

**Option 1: Raycasting (2.5D)**
- Cast rays for each column of screen
- Calculate wall height based on distance
- Draw vertical strips for walls
- Draw floor and ceiling as gradients

**Option 2: WebGL (Full 3D)**
- Create cube meshes for walls
- Create plane meshes for floor/ceiling
- Apply textures or colors
- Use perspective projection

#### Collision System
```javascript
class CollisionSystem {
  checkPointCollision(point) {
    // Check if point is inside wall
  }
  
  checkCircleCollision(position, radius) {
    // Check if circle collides with walls
  }
  
  checkRayCollision(origin, direction, maxDistance) {
    // Raycast for hit detection
  }
  
  resolveCollision(position, radius) {
    // Push object out of walls
  }
}
```

#### Environmental Elements
- **Walls**: Different colors/textures for variety
- **Obstacles**: Low walls for cover
- **Props**: Crates, barrels (optional)
- **Lighting**: Darker areas, bright areas
- **Spawn Points**: Player and enemy spawn locations

#### Lighting System
- Ambient lighting (base brightness)
- Distance fog (fade to darkness)
- Point lights (optional, for advanced rendering)
- Dynamic shadows (optional, performance heavy)

#### Skybox/Background
- Solid color gradient
- Static skybox image (if using WebGL)
- Distant mountains/horizon

### Integration Points
- Provide collision data to player and enemy systems
- Export spawn points for entity placement
- Render in correct order with other game objects
- Provide raycasting for weapon hit detection

### Testing Criteria
- Level renders correctly
- Collision detection works accurately
- No z-fighting or visual glitches
- Performance is smooth (60 FPS)
- Spawn points are valid locations
- Obstacles provide gameplay value

### Performance Considerations
- Use spatial partitioning for collision checks
- Implement frustum culling (only render visible)
- Optimize raycasting algorithm
- Cache collision data
- Use simple geometry for better performance

---

## Agent 5: Enemy AI & Combat

### Objective
Create intelligent enemy entities with AI behavior, combat mechanics, health systems, and spawn management.

### Deliverables
1. Enemy entities with basic AI
2. Pathfinding or simple movement patterns
3. Enemy shooting mechanics
4. Health systems for both player and enemies
5. Enemy spawn system
6. Death animations and respawning

### Technical Specifications

#### File Structure
- `js/enemy.js` - Enemy class and AI logic
- `js/health.js` - Health system component

#### Enemy Class
```javascript
class Enemy {
  constructor(x, y, z) {
    this.position = { x, y, z };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.damage = 10;
    this.moveSpeed = 2;
    this.detectionRange = 10;
    this.attackRange = 8;
    this.fireRate = 1; // Shots per second
    this.lastShotTime = 0;
    this.state = 'idle'; // idle, patrol, chase, attack, dead
    this.target = null;
    this.isDead = false;
    this.deathTime = 0;
  }
  
  update(deltaTime, player, level) {
    // Update AI state machine
    // Move towards player
    // Shoot at player
  }
  
  takeDamage(amount) {
    // Reduce health
    // Trigger death if health <= 0
  }
  
  die() {
    // Death logic
  }
  
  detectPlayer(player) {
    // Check if player is in range
  }
  
  shootAtPlayer(player) {
    // Shoot at player position
  }
}
```

#### AI States
1. **Idle**: Standing still, scanning for player
2. **Patrol**: Moving along waypoints (optional)
3. **Chase**: Moving towards player
4. **Attack**: Shooting at player
5. **Dead**: Disabled, waiting for cleanup

#### AI Behavior
```javascript
updateAI(deltaTime, player, level) {
  switch(this.state) {
    case 'idle':
      if (this.detectPlayer(player)) {
        this.state = 'chase';
      }
      break;
    
    case 'chase':
      if (this.distanceToPlayer(player) < this.attackRange) {
        this.state = 'attack';
      } else {
        this.moveTowards(player.position, deltaTime);
      }
      break;
    
    case 'attack':
      if (this.distanceToPlayer(player) > this.attackRange) {
        this.state = 'chase';
      } else {
        this.shootAtPlayer(player);
      }
      break;
    
    case 'dead':
      // Wait for respawn or cleanup
      break;
  }
}
```

#### Pathfinding
**Simple Approach**: Direct line to player
- Calculate direction vector
- Move towards player
- Avoid getting stuck on walls (collision sliding)

**Advanced Approach** (Optional): A* pathfinding
- Grid-based pathfinding
- Calculate path around obstacles
- Follow waypoints

#### Health System
```javascript
class Health {
  constructor(maxHealth) {
    this.maxHealth = maxHealth;
    this.current = maxHealth;
  }
  
  takeDamage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0; // Returns true if dead
  }
  
  heal(amount) {
    this.current = Math.min(this.maxHealth, this.current + amount);
  }
  
  getPercentage() {
    return this.current / this.maxHealth;
  }
}
```

#### Enemy Spawning
```javascript
class EnemySpawner {
  constructor() {
    this.enemies = [];
    this.maxEnemies = 10;
    this.spawnPoints = [];
    this.spawnRate = 5; // Seconds between spawns
    this.lastSpawnTime = 0;
  }
  
  update(deltaTime) {
    // Spawn new enemies if below max
    // Remove dead enemies
  }
  
  spawnEnemy() {
    // Create enemy at random spawn point
  }
  
  getActiveEnemies() {
    return this.enemies.filter(e => !e.isDead);
  }
}
```

#### Death & Respawn
- Death animation (fade out, fall down)
- Drop loot (optional: ammo, health)
- Remove after delay
- Respawn after timer (or wave-based)

### Integration Points
- Access player position for AI targeting
- Use level collision for movement
- Deal damage to player health
- Trigger audio on shoot/death
- Update UI kill counter
- Provide targets for weapon system

### Testing Criteria
- Enemies detect player correctly
- AI behavior is challenging but fair
- Enemies navigate around obstacles
- Shooting accuracy is reasonable
- Health system works correctly
- Death animations play properly
- Spawning works as expected

### Performance Considerations
- Limit active enemies
- Use object pooling for enemy instances
- Optimize pathfinding calculations
- Update AI at lower frequency (e.g., 10Hz instead of 60Hz)
- Use simple collision for enemies

---

## Agent 6: UI & HUD

### Objective
Create a comprehensive user interface including HUD elements, menus, and game screens.

### Deliverables
1. Health bar display
2. Ammo counter
3. Weapon display
4. Score/kill counter
5. Mini-map
6. Game over screen
7. Pause menu
8. Settings menu (sensitivity, volume, etc.)

### Technical Specifications

#### File Structure
- `js/ui.js` - UI manager and HUD components
- `css/style.css` - UI styling

#### UI Manager
```javascript
class UIManager {
  constructor() {
    this.elements = {};
    this.isMenuOpen = false;
    this.isPaused = false;
  }
  
  init() {
    // Create all UI elements
    this.createHUD();
    this.createMenus();
    this.setupEventListeners();
  }
  
  createHUD() {
    // Create HUD elements
  }
  
  updateHUD(gameState) {
    // Update HUD with current game state
  }
  
  showMenu(menuName) {
    // Display specific menu
  }
  
  hideMenu() {
    // Hide current menu
  }
}
```

#### HUD Components

**Health Bar**
```html
<div id="health-container">
  <div id="health-bar">
    <div id="health-fill"></div>
  </div>
  <span id="health-text">100</span>
</div>
```

**Ammo Counter**
```html
<div id="ammo-container">
  <span id="ammo-current">30</span>
  <span class="separator">/</span>
  <span id="ammo-reserve">180</span>
</div>
```

**Weapon Display**
```html
<div id="weapon-display">
  <span id="weapon-name">Rifle</span>
  <div id="weapon-icon"></div>
</div>
```

**Kill Counter**
```html
<div id="score-container">
  <span>Kills:</span>
  <span id="kill-count">0</span>
</div>
```

**Crosshair**
```html
<div id="crosshair">
  <div class="crosshair-line vertical"></div>
  <div class="crosshair-line horizontal"></div>
</div>
```

**Mini-map** (Optional)
```html
<div id="minimap">
  <canvas id="minimap-canvas"></canvas>
</div>
```

#### Menus

**Main Menu**
- Start Game button
- Settings button
- Controls button
- Credits

**Pause Menu**
- Resume button
- Settings button
- Quit to Menu button
- Show on ESC key

**Game Over Screen**
- Final score
- Time survived
- Enemies killed
- Retry button
- Main Menu button

**Settings Menu**
- Mouse sensitivity slider
- Master volume slider
- SFX volume slider
- Music volume slider
- Graphics quality (optional)
- Apply/Save buttons

#### CSS Styling
```css
/* HUD Styling */
#hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#health-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  /* Styling */
}

#ammo-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 24px;
  font-family: monospace;
}

#crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Styling */
}

/* Menu Styling */
.menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  pointer-events: all;
}

.menu.active {
  display: flex;
}

/* Button Styling */
.button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  /* Styling */
}
```

#### UI Update Logic
```javascript
update(player, weaponManager, gameState) {
  // Update health
  const healthPercent = (player.health / player.maxHealth) * 100;
  this.elements.healthFill.style.width = healthPercent + '%';
  this.elements.healthText.textContent = Math.ceil(player.health);
  
  // Update ammo
  const weapon = weaponManager.getCurrentWeapon();
  this.elements.ammoCurrent.textContent = weapon.currentAmmo;
  this.elements.ammoReserve.textContent = weapon.reserveAmmo;
  
  // Update weapon name
  this.elements.weaponName.textContent = weapon.name;
  
  // Update kills
  this.elements.killCount.textContent = gameState.kills;
}
```

#### Mini-map (Optional)
- Top-down view of level
- Player position and direction
- Enemy positions
- Update in real-time

### Integration Points
- Access player health
- Access weapon data
- Access game state (score, kills, etc.)
- Hook into input system for menu controls
- Trigger game state changes (pause, restart)
- Update audio settings

### Testing Criteria
- HUD updates in real-time
- Health bar accurately reflects health
- Ammo counter updates on shoot/reload
- Menus open and close properly
- Settings persist and apply correctly
- Crosshair is centered
- UI is readable and clear
- No performance impact from UI updates

### Performance Considerations
- Update UI at 30Hz instead of 60Hz
- Use CSS transforms for animations
- Minimize DOM manipulations
- Cache element references
- Use CSS for visual effects instead of JS

---

## Agent 7: Sound & Audio

### Objective
Implement a comprehensive audio system with sound effects, background music, and spatial audio.

### Deliverables
1. Shooting sound effects
2. Footstep sounds
3. Hit/damage sounds
4. Background music
5. Reload sounds
6. Spatial audio (sounds from different directions)

### Technical Specifications

#### File Structure
- `js/audio.js` - Audio manager and sound system
- `assets/sounds/` - Sound effect files

#### Audio Manager
```javascript
class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.music = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.5;
    this.isMuted = false;
  }
  
  init() {
    // Initialize Web Audio API
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.loadSounds();
  }
  
  loadSound(name, url) {
    // Load and decode audio file
  }
  
  playSound(name, volume = 1.0, loop = false) {
    // Play sound effect
  }
  
  playSpatialSound(name, position, listenerPosition) {
    // Play 3D positioned sound
  }
  
  playMusic(name, loop = true) {
    // Play background music
  }
  
  stopMusic() {
    // Stop background music
  }
  
  setMasterVolume(volume) {
    this.masterVolume = volume;
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = volume;
  }
  
  setMusicVolume(volume) {
    this.musicVolume = volume;
  }
}
```

#### Sound Categories

**Weapon Sounds**
- Pistol shot
- Rifle shot
- Shotgun blast
- Empty gun click
- Reload sound
- Weapon switch sound

**Player Sounds**
- Footsteps (different surfaces optional)
- Jump sound
- Landing sound
- Take damage grunt
- Death sound
- Sprint breathing (optional)

**Enemy Sounds**
- Enemy shoot
- Enemy hurt
- Enemy death
- Enemy alert sound

**Impact Sounds**
- Bullet hit wall
- Bullet hit enemy
- Grenade explosion (if implemented)

**UI Sounds**
- Menu click
- Menu hover
- Button press
- Game over sound
- Level up/achievement sound

**Ambient Sounds**
- Background music (tense, action-oriented)
- Wind/atmosphere (optional)
- Distant sounds (optional)

#### Web Audio API Implementation
```javascript
// Play simple sound
playSound(name, volume = 1.0) {
  if (!this.sounds[name]) return;
  
  const source = this.context.createBufferSource();
  source.buffer = this.sounds[name];
  
  const gainNode = this.context.createGain();
  gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
  
  source.connect(gainNode);
  gainNode.connect(this.context.destination);
  
  source.start(0);
  
  return source;
}

// Play spatial (3D) sound
playSpatialSound(name, position, listenerPosition) {
  if (!this.sounds[name]) return;
  
  const source = this.context.createBufferSource();
  source.buffer = this.sounds[name];
  
  const panner = this.context.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 20;
  panner.rolloffFactor = 1;
  
  panner.setPosition(position.x, position.y, position.z);
  
  const listener = this.context.listener;
  listener.setPosition(listenerPosition.x, listenerPosition.y, listenerPosition.z);
  
  source.connect(panner);
  panner.connect(this.context.destination);
  
  source.start(0);
  
  return source;
}
```

#### Sound File Format
- Use `.mp3` for compatibility (fallback to `.ogg`)
- Keep files small (< 100KB each)
- Use 44.1kHz sample rate
- Mono for sound effects, stereo for music

#### Sound Placeholders
If you don't have audio files:
- Use Web Audio API to generate tones
- Beep sounds for weapons
- White noise for impacts
- Simple synth sounds

```javascript
// Generate simple beep
generateBeep(frequency, duration) {
  const oscillator = this.context.createOscillator();
  const gainNode = this.context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(this.context.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
  
  oscillator.start(this.context.currentTime);
  oscillator.stop(this.context.currentTime + duration);
}
```

### Integration Points
- Triggered by weapon system on shoot/reload
- Triggered by player on movement/damage
- Triggered by enemy on shoot/death
- Controlled by UI settings menu
- Updated listener position from camera

### Testing Criteria
- All sounds play correctly
- Volume controls work properly
- Spatial audio sounds come from correct direction
- No audio clipping or distortion
- Music loops seamlessly
- Sounds don't overwhelm each other
- Performance is not impacted

### Performance Considerations
- Limit simultaneous sounds (e.g., max 16)
- Reuse audio sources (object pooling)
- Stop distant spatial sounds
- Compress audio files
- Lazy load sounds as needed
- Use audio sprites for many small sounds

---

## Agent 8: Visual Effects & Polish

### Objective
Add visual effects and polish to enhance the game's look and feel.

### Deliverables
1. Particle effects for bullet impacts
2. Blood splatter effects
3. Damage indicators
4. Screen shake on shooting
5. Death animations
6. Hit markers
7. Fog or distance effects

### Technical Specifications

#### File Structure
- `js/particles.js` - Particle system
- `js/effects.js` - Visual effects manager

#### Particle System
```javascript
class Particle {
  constructor(x, y, z, velocity, color, lifetime) {
    this.position = { x, y, z };
    this.velocity = velocity;
    this.color = color;
    this.lifetime = lifetime;
    this.age = 0;
    this.size = 1;
    this.gravity = -5;
    this.isDead = false;
  }
  
  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    this.velocity.y += this.gravity * deltaTime;
    
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.isDead = true;
    }
  }
  
  render(camera, ctx) {
    // Render particle
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 1000;
  }
  
  emit(config) {
    // Create new particles
  }
  
  update(deltaTime) {
    // Update all particles
    this.particles = this.particles.filter(p => !p.isDead);
  }
  
  render(camera, ctx) {
    // Render all particles
  }
}
```

#### Effect Types

**Bullet Impact**
- Spawn 5-10 particles on wall hit
- Gray/white color
- Spread outward from impact point
- Short lifetime (0.3-0.5s)

**Blood Splatter**
- Spawn 10-20 particles on enemy hit
- Red color
- Spread outward and fall down
- Medium lifetime (0.5-1s)
- Leave decals (optional)

**Muzzle Flash**
- Bright yellow/orange flash at gun barrel
- Very short lifetime (0.05s)
- Add glow effect
- Scale with weapon type

**Shell Casings** (Optional)
- Small brass particles
- Eject from weapon
- Spin and bounce
- Medium lifetime (1-2s)

**Smoke** (Optional)
- Gray particles from gun barrel
- Slow-moving, fade out
- Long lifetime (2-3s)

#### Screen Effects

**Screen Shake**
```javascript
class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.offset = { x: 0, y: 0 };
  }
  
  shake(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
  }
  
  update(deltaTime) {
    if (this.duration > 0) {
      this.offset.x = (Math.random() - 0.5) * this.intensity;
      this.offset.y = (Math.random() - 0.5) * this.intensity;
      this.duration -= deltaTime;
    } else {
      this.offset.x = 0;
      this.offset.y = 0;
    }
  }
  
  getOffset() {
    return this.offset;
  }
}
```

**Damage Indicator**
- Red vignette flash on damage
- Directional indicators (optional)
- Brief duration (0.2s)

```javascript
showDamageFlash() {
  const overlay = document.getElementById('damage-overlay');
  overlay.style.opacity = '0.5';
  setTimeout(() => {
    overlay.style.opacity = '0';
  }, 200);
}
```

**Hit Marker**
- White X in center of screen on hit
- Brief display (0.1s)
- Scale with damage dealt

```html
<div id="hitmarker">✕</div>
```

**Death Animation**
- Camera fall to ground
- Screen fade to red/black
- Slow motion effect (optional)

#### Visual Polish

**Distance Fog**
```javascript
// Adjust color/alpha based on distance
function applyFog(color, distance, fogStart, fogEnd) {
  const fogFactor = Math.max(0, Math.min(1, (distance - fogStart) / (fogEnd - fogStart)));
  return lerpColor(color, fogColor, fogFactor);
}
```

**Lighting Effects**
- Brighter colors for closer objects
- Darker colors for distant objects
- Dynamic shadows (advanced, optional)

**Camera Effects**
- Head bob while walking
- Weapon sway
- Smooth camera movement
- Field of view changes (sprint/zoom)

**UI Animations**
- Health bar smooth transitions
- Ammo counter flash on reload
- Kill counter increment animation
- Menu transitions

### Integration Points
- Triggered by weapon system (muzzle flash, impacts)
- Triggered by damage system (blood, damage indicator)
- Applied to camera (screen shake, death animation)
- Rendered in game loop
- Performance monitored for optimization

### Testing Criteria
- Particles render correctly
- Effects don't cause performance issues
- Screen shake feels appropriate
- Hit markers appear reliably
- Animations are smooth
- Effects enhance gameplay, not distract

### Performance Considerations
- Use object pooling for particles
- Limit maximum particles
- Remove off-screen particles early
- Use simple geometry for particles
- Optimize particle rendering
- Consider reducing effects on low-end devices

---

## Agent 9: Game Logic & State Management

### Objective
Implement game state management, game modes, scoring systems, and save/load functionality.

### Deliverables
1. Game states (menu, playing, paused, game over)
2. Wave/round system
3. Scoring system
4. Difficulty progression
5. Save/load functionality using localStorage
6. Achievement system

### Technical Specifications

#### File Structure
- `js/gamestate.js` - Game state manager
- `js/score.js` - Scoring and progression system

#### Game State Manager
```javascript
class GameStateManager {
  constructor() {
    this.currentState = 'menu';
    this.states = {
      menu: new MenuState(),
      playing: new PlayingState(),
      paused: new PausedState(),
      gameOver: new GameOverState(),
    };
  }
  
  setState(stateName) {
    if (this.states[stateName]) {
      this.states[this.currentState].exit();
      this.currentState = stateName;
      this.states[this.currentState].enter();
    }
  }
  
  update(deltaTime) {
    this.states[this.currentState].update(deltaTime);
  }
  
  render() {
    this.states[this.currentState].render();
  }
}

class GameState {
  enter() {
    // Initialize state
  }
  
  exit() {
    // Cleanup state
  }
  
  update(deltaTime) {
    // Update state logic
  }
  
  render() {
    // Render state
  }
}
```

#### Game States

**Menu State**
- Show main menu
- Handle menu input
- Start new game or load save

**Playing State**
- Main gameplay
- Update player, enemies, weapons
- Handle pause input (ESC key)
- Update wave/round system

**Paused State**
- Freeze game time
- Show pause menu
- Resume or quit

**Game Over State**
- Show final stats
- Handle retry or menu return
- Save high score

#### Wave System
```javascript
class WaveManager {
  constructor() {
    this.currentWave = 1;
    this.enemiesPerWave = 5;
    this.enemiesRemaining = 0;
    this.waveInProgress = false;
    this.timeBetweenWaves = 10; // Seconds
    this.waveTimer = 0;
  }
  
  startWave() {
    this.waveInProgress = true;
    this.enemiesRemaining = this.enemiesPerWave + (this.currentWave - 1) * 2;
    // Spawn enemies
  }
  
  endWave() {
    this.waveInProgress = false;
    this.currentWave++;
    this.waveTimer = this.timeBetweenWaves;
    // Grant rewards
  }
  
  update(deltaTime) {
    if (!this.waveInProgress) {
      this.waveTimer -= deltaTime;
      if (this.waveTimer <= 0) {
        this.startWave();
      }
    }
  }
  
  onEnemyKilled() {
    this.enemiesRemaining--;
    if (this.enemiesRemaining <= 0) {
      this.endWave();
    }
  }
}
```

#### Scoring System
```javascript
class ScoreManager {
  constructor() {
    this.score = 0;
    this.kills = 0;
    this.accuracy = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.highScore = this.loadHighScore();
    this.multiplier = 1;
    this.multiplierTimer = 0;
  }
  
  addKill(enemyType) {
    this.kills++;
    const basePoints = 100;
    const points = basePoints * this.multiplier;
    this.score += points;
    this.increaseMultiplier();
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }
  
  recordShot(hit) {
    this.shotsFired++;
    if (hit) {
      this.shotsHit++;
    }
    this.accuracy = (this.shotsHit / this.shotsFired) * 100;
  }
  
  increaseMultiplier() {
    this.multiplier = Math.min(4, this.multiplier + 0.5);
    this.multiplierTimer = 5; // 5 seconds to maintain
  }
  
  update(deltaTime) {
    if (this.multiplier > 1) {
      this.multiplierTimer -= deltaTime;
      if (this.multiplierTimer <= 0) {
        this.multiplier = 1;
      }
    }
  }
  
  loadHighScore() {
    return parseInt(localStorage.getItem('fps_highscore') || '0');
  }
  
  saveHighScore() {
    localStorage.setItem('fps_highscore', this.highScore.toString());
  }
}
```

#### Difficulty Progression
```javascript
class DifficultyManager {
  constructor() {
    this.difficulty = 1;
    this.enemyHealthMultiplier = 1;
    this.enemyDamageMultiplier = 1;
    this.enemySpeedMultiplier = 1;
  }
  
  increaseDifficulty(wave) {
    this.difficulty = 1 + (wave - 1) * 0.1;
    this.enemyHealthMultiplier = 1 + (wave - 1) * 0.15;
    this.enemyDamageMultiplier = 1 + (wave - 1) * 0.1;
    this.enemySpeedMultiplier = Math.min(1.5, 1 + (wave - 1) * 0.05);
  }
}
```

#### Save/Load System
```javascript
class SaveManager {
  constructor() {
    this.saveKey = 'fps_game_save';
  }
  
  saveGame(gameData) {
    const saveData = {
      score: gameData.score,
      wave: gameData.wave,
      playerHealth: gameData.playerHealth,
      weapons: gameData.weapons,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
  }
  
  loadGame() {
    const saveData = localStorage.getItem(this.saveKey);
    if (saveData) {
      return JSON.parse(saveData);
    }
    return null;
  }
  
  deleteSave() {
    localStorage.removeItem(this.saveKey);
  }
  
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }
}
```

#### Achievement System
```javascript
class AchievementManager {
  constructor() {
    this.achievements = [
      { id: 'first_kill', name: 'First Blood', description: 'Get your first kill', unlocked: false },
      { id: 'wave_5', name: 'Survivor', description: 'Reach wave 5', unlocked: false },
      { id: 'wave_10', name: 'Veteran', description: 'Reach wave 10', unlocked: false },
      { id: 'kills_50', name: 'Hunter', description: 'Kill 50 enemies', unlocked: false },
      { id: 'kills_100', name: 'Slayer', description: 'Kill 100 enemies', unlocked: false },
      { id: 'accuracy_80', name: 'Marksman', description: 'Achieve 80% accuracy', unlocked: false },
    ];
    this.loadAchievements();
  }
  
  checkAchievements(gameData) {
    // Check each achievement condition
    this.check('first_kill', gameData.kills >= 1);
    this.check('wave_5', gameData.wave >= 5);
    this.check('wave_10', gameData.wave >= 10);
    this.check('kills_50', gameData.kills >= 50);
    this.check('kills_100', gameData.kills >= 100);
    this.check('accuracy_80', gameData.accuracy >= 80);
  }
  
  check(id, condition) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked && condition) {
      achievement.unlocked = true;
      this.onAchievementUnlocked(achievement);
      this.saveAchievements();
    }
  }
  
  onAchievementUnlocked(achievement) {
    // Show notification
    console.log(`Achievement Unlocked: ${achievement.name}`);
  }
  
  saveAchievements() {
    localStorage.setItem('fps_achievements', JSON.stringify(this.achievements));
  }
  
  loadAchievements() {
    const saved = localStorage.getItem('fps_achievements');
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      this.achievements.forEach(achievement => {
        const saved = savedAchievements.find(a => a.id === achievement.id);
        if (saved) {
          achievement.unlocked = saved.unlocked;
        }
      });
    }
  }
}
```

### Integration Points
- Control game flow and state transitions
- Manage wave progression and enemy spawning
- Track and display score
- Save/load game data
- Update UI with game state information
- Handle achievement notifications

### Testing Criteria
- State transitions work correctly
- Wave system progresses properly
- Scoring is accurate
- Save/load preserves game state
- Achievements unlock correctly
- Difficulty scales appropriately
- No data loss on page refresh

### Performance Considerations
- Minimize localStorage writes
- Serialize data efficiently
- Cache achievement checks
- Optimize state update loops
- Debounce save operations

---

## Agent 10: Optimization & Performance

### Objective
Optimize the game for smooth performance across different devices and browsers.

### Deliverables
1. Object pooling for bullets and particles
2. Frustum culling for rendering optimization
3. FPS counter and performance monitoring
4. Collision detection optimization
5. Level of detail (LOD) system
6. Asset optimization and bundling

### Technical Specifications

#### File Structure
- `js/objectpool.js` - Object pooling system
- `js/performance.js` - Performance monitoring

#### Object Pooling
```javascript
class ObjectPool {
  constructor(createFunc, resetFunc, initialSize = 10) {
    this.createFunc = createFunc;
    this.resetFunc = resetFunc;
    this.pool = [];
    this.active = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFunc());
    }
  }
  
  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFunc();
    }
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.resetFunc(obj);
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
  
  getActiveCount() {
    return this.active.length;
  }
}

// Usage example
const bulletPool = new ObjectPool(
  () => new Bullet(),
  (bullet) => bullet.reset(),
  50
);
```

#### Frustum Culling
```javascript
class FrustumCuller {
  constructor(camera) {
    this.camera = camera;
  }
  
  isInView(position, radius) {
    // Check if object is within camera view
    // Simple distance check for now
    const distance = this.distanceToCamera(position);
    const maxDistance = this.camera.farPlane;
    
    if (distance > maxDistance) {
      return false;
    }
    
    // Check if within FOV (simplified)
    const directionToObject = this.normalize({
      x: position.x - this.camera.position.x,
      y: position.y - this.camera.position.y,
      z: position.z - this.camera.position.z,
    });
    
    const dot = this.dotProduct(directionToObject, this.camera.forward);
    const fovCos = Math.cos(this.camera.fov / 2);
    
    return dot > fovCos;
  }
  
  filterVisible(objects) {
    return objects.filter(obj => this.isInView(obj.position, obj.radius || 1));
  }
}
```

#### Performance Monitor
```javascript
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.drawCalls = 0;
    this.triangles = 0;
    this.displayElement = null;
  }
  
  init() {
    this.displayElement = document.getElementById('performance-stats');
  }
  
  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      this.updateDisplay();
    }
  }
  
  updateDisplay() {
    if (this.displayElement) {
      this.displayElement.innerHTML = `
        FPS: ${this.fps}
        Draw Calls: ${this.drawCalls}
        Triangles: ${this.triangles}
      `;
    }
  }
  
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }
  
  resetStats() {
    this.drawCalls = 0;
    this.triangles = 0;
  }
}
```

#### Collision Optimization
```javascript
class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }
  
  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
  
  insert(entity) {
    const key = this.getCellKey(entity.position.x, entity.position.z);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(entity);
  }
  
  clear() {
    this.grid.clear();
  }
  
  getNearby(position, radius) {
    const nearby = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(position.x / this.cellSize);
    const centerY = Math.floor(position.z / this.cellSize);
    
    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let y = centerY - cellRadius; y <= centerY + cellRadius; y++) {
        const key = `${x},${y}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key));
        }
      }
    }
    
    return nearby;
  }
}
```

#### Level of Detail (LOD)
```javascript
class LODManager {
  constructor() {
    this.lodLevels = [
      { distance: 10, detail: 'high' },
      { distance: 20, detail: 'medium' },
      { distance: 40, detail: 'low' },
    ];
  }
  
  getLOD(distance) {
    for (const level of this.lodLevels) {
      if (distance < level.distance) {
        return level.detail;
      }
    }
    return 'lowest';
  }
  
  shouldUpdate(entity, camera) {
    const distance = this.distance(entity.position, camera.position);
    const lod = this.getLOD(distance);
    
    // Update entities less frequently at lower LOD
    switch (lod) {
      case 'high': return true; // Every frame
      case 'medium': return entity.frameCount % 2 === 0; // Every 2 frames
      case 'low': return entity.frameCount % 4 === 0; // Every 4 frames
      case 'lowest': return entity.frameCount % 8 === 0; // Every 8 frames
    }
  }
}
```

#### Optimization Techniques

**Rendering Optimization**
1. Batch draw calls
2. Use instanced rendering for repeated objects
3. Cull back-facing polygons
4. Use texture atlases
5. Minimize state changes

**Update Loop Optimization**
1. Update AI at lower frequency (10-30 Hz)
2. Use fixed time step for physics
3. Skip updates for off-screen entities
4. Use delta time for smooth movement

**Memory Optimization**
1. Object pooling for frequently created objects
2. Reuse arrays instead of creating new ones
3. Clean up unused resources
4. Use typed arrays for large datasets

**Asset Optimization**
1. Compress textures
2. Use appropriate image formats (WebP)
3. Lazy load assets
4. Use audio sprites
5. Minify JavaScript

#### Performance Profiling
```javascript
class Profiler {
  constructor() {
    this.timings = {};
  }
  
  start(label) {
    this.timings[label] = performance.now();
  }
  
  end(label) {
    if (this.timings[label]) {
      const elapsed = performance.now() - this.timings[label];
      console.log(`${label}: ${elapsed.toFixed(2)}ms`);
      delete this.timings[label];
    }
  }
  
  measure(label, func) {
    this.start(label);
    const result = func();
    this.end(label);
    return result;
  }
}

// Usage
const profiler = new Profiler();
profiler.start('render');
// ... rendering code ...
profiler.end('render');
```

#### FPS Counter UI
```html
<div id="fps-counter" style="position: fixed; top: 10px; right: 10px; color: white; font-family: monospace;">
  FPS: <span id="fps-value">60</span>
</div>
```

### Integration Points
- Integrate object pooling with bullet and particle systems
- Apply frustum culling to rendering pipeline
- Add performance monitoring to game loop
- Optimize collision detection with spatial partitioning
- Implement LOD for enemies and effects
- Profile critical code paths

### Testing Criteria
- Game runs at 60 FPS on target hardware
- Object pools reduce garbage collection
- Frustum culling improves frame rate
- Collision detection scales with entity count
- LOD reduces computational load
- Memory usage is stable over time
- No performance degradation over extended play

### Performance Targets
- 60 FPS on mid-range hardware
- < 100ms load time
- < 200MB memory usage
- Smooth gameplay with 20+ enemies
- No frame drops during intense action

### Performance Considerations
- Profile before optimizing
- Focus on bottlenecks first
- Balance quality and performance
- Test on various devices
- Monitor memory usage
- Use efficient algorithms and data structures

---

## Development Workflow

### Recommended Implementation Order

1. **Agent 1**: Core Engine & Architecture - Foundation for everything
2. **Agent 2**: Player Controls & Movement - Essential gameplay
3. **Agent 4**: Level Design & Environment - Needed for testing movement
4. **Agent 3**: Weapons & Shooting - Core gameplay mechanic
5. **Agent 5**: Enemy AI & Combat - Make game challenging
6. **Agent 6**: UI & HUD - Player feedback
7. **Agent 9**: Game Logic & State - Proper game flow
8. **Agent 8**: Visual Effects - Polish
9. **Agent 7**: Sound & Audio - Immersion
10. **Agent 10**: Optimization - Performance improvements

### Testing Strategy

- Test each component individually
- Integration test after major components
- Performance test with full game running
- Cross-browser testing
- Playtest for game balance

### Documentation

Each agent should:
- Comment code thoroughly
- Document public APIs
- Note integration requirements
- List known limitations
- Provide usage examples

---

## Final Notes

- Prioritize functionality over graphics initially
- Keep code modular and maintainable
- Test frequently during development
- Optimize only after profiling
- Consider progressive enhancement
- Plan for future features
- Make game fun first, pretty second

**Good luck building an awesome FPS game!**
