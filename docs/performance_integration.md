# Performance Systems Integration Guide

This guide shows how to integrate and use the performance optimization systems in Arena Blitz FPS.

## Table of Contents
1. [Object Pooling](#object-pooling)
2. [Performance Metrics](#performance-metrics)
3. [Memory Management](#memory-management)
4. [Spatial Partitioning](#spatial-partitioning)
5. [Dynamic Resolution](#dynamic-resolution)
6. [LOD Management](#lod-management)
7. [Complete Example](#complete-example)

---

## Object Pooling

Object pooling eliminates GC pauses by reusing objects instead of creating/destroying them.

### Basic Object Pool

```javascript
import { ObjectPool } from './src/pooling/ObjectPool.js';

// Define factory function
const factory = () => ({
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  active: false
});

// Define reset function
const reset = (obj) => {
  obj.position.x = 0;
  obj.position.y = 0;
  obj.position.z = 0;
  obj.velocity.x = 0;
  obj.velocity.y = 0;
  obj.velocity.z = 0;
  obj.active = false;
};

// Create pool
const pool = new ObjectPool(factory, reset, 10, 100);

// Acquire object
const obj = pool.acquire();
obj.active = true;
obj.position.x = 10;

// Release object when done
pool.release(obj);

// Get statistics
const stats = pool.getStats();
console.log(`Pool: ${stats.currentInUse} in use, ${stats.availableCount} available`);
```

### Specialized Pools

#### Projectile Pool

```javascript
import { ProjectilePool } from './src/pooling/ProjectilePool.js';

// Create pool
const projectilePool = new ProjectilePool(scene, 50, 500);

// Spawn projectile
const position = new THREE.Vector3(0, 1, 0);
const direction = new THREE.Vector3(0, 0, 1);
const speed = 50;
const damage = 25;

const projectile = projectilePool.spawn(
  position, direction, speed, damage, 'player1', 'ar_mk4'
);

// Update all projectiles
projectilePool.update(deltaTime);

// Projectiles automatically released after lifetime
```

#### Decal Pool

```javascript
import { DecalPool } from './src/pooling/DecalPool.js';

// Create pool
const decalPool = new DecalPool(scene, 100, 500);

// Spawn decal
const hitPosition = new THREE.Vector3(5, 1, 3);
const surfaceNormal = new THREE.Vector3(0, 1, 0);

decalPool.spawn(hitPosition, surfaceNormal);

// Update (handles fading)
decalPool.update(deltaTime);
```

#### Particle Pool

```javascript
import { ParticlePool } from './src/pooling/ParticlePool.js';

// Create pool
const particlePool = new ParticlePool(scene, 200, 2000);

// Spawn single particle
const particle = particlePool.spawn(
  position,
  velocity,
  {
    lifetime: 1.0,
    startSize: 0.1,
    endSize: 0.05,
    color: 0xffaa00,
    gravity: -9.8
  }
);

// Emit burst
particlePool.emitBurst(
  position,
  20, // particle count
  {
    speed: 2.0,
    spread: 0.5,
    lifetime: 0.8,
    color: 0xff0000
  }
);

// Update
particlePool.update(deltaTime);
```

#### Audio Pool

```javascript
import { AudioPool } from './src/pooling/AudioPool.js';

// Create audio context and pool
const audioContext = new AudioContext();
const audioPool = new AudioPool(audioContext, 20, 100);

// Play sound
const source = audioPool.play(audioBuffer, {
  volume: 0.8,
  loop: false,
  playbackRate: 1.0,
  pan: 0.0
});

// Stop sound manually
audioPool.stop(source);

// Fade volume
audioPool.fadeVolume(source, 0, 1.0); // Fade to 0 over 1 second
```

---

## Performance Metrics

Monitor and track performance in real-time.

### Basic Usage

```javascript
import { metrics } from './performance/metrics.js';

// In your game loop
function gameLoop() {
  // Begin frame
  metrics.beginFrame();
  
  // ... game logic ...
  
  // End frame
  metrics.endFrame();
}

// Get metrics snapshot
const snapshot = metrics.getMetrics();
console.log(`FPS: ${snapshot.fps}`);
console.log(`Frame Time: ${snapshot.frameTime.avg}ms`);
console.log(`Memory: ${snapshot.memory.js}`);

// Log to console
metrics.logMetrics();
```

### Custom Performance Marks

```javascript
// Mark specific operations
metrics.mark('map-load-start');

await loadMap('arena_hub');

metrics.mark('map-load-end');

// Measure duration
const duration = metrics.measure('map-load', 'map-load-start', 'map-load-end');
console.log(`Map loaded in ${duration}ms`);
```

### Network Tracking

```javascript
// Track packet
metrics.trackNetworkPacket('in', packetSize);
metrics.trackNetworkPacket('out', packetSize);

// Update throughput (call periodically)
metrics.updateNetworkThroughput(deltaTime);

// Update latency
metrics.updateLatency(pingTime);
```

### Stats.js Overlay

Stats.js overlay is automatically shown when metrics are initialized with `stats: true`.

```javascript
import { PerformanceMetrics } from './performance/metrics.js';

const metrics = new PerformanceMetrics({ 
  enabled: true, 
  stats: true // Enable stats.js overlay
});
```

---

## Memory Management

Properly dispose of Three.js resources to avoid memory leaks.

```javascript
import { memoryManager } from './src/pooling/MemoryManager.js';

// Dispose mesh
memoryManager.disposeMesh(mesh);

// Dispose material (handles textures)
memoryManager.disposeMaterial(material);

// Dispose entire scene
memoryManager.disposeScene(scene);

// Calculate GPU memory usage
const memoryUsage = memoryManager.calculateSceneMemory(scene);
console.log(`GPU Memory: ${(memoryUsage.total / 1024 / 1024).toFixed(2)} MB`);

// Track GPU memory in metrics
metrics.trackGPUMemory(memoryUsage.textures, memoryUsage.geometries);

// Periodic cleanup
memoryManager.cleanup();

// Register cleanup callback
memoryManager.onCleanup(() => {
  // Custom cleanup logic
  projectilePool.releaseAll();
  decalPool.releaseAll();
});
```

### Disposal Patterns

```javascript
// Dispose geometry
geometry.dispose();

// Dispose texture
texture.dispose();

// Dispose material with all textures
function disposeMaterial(material) {
  if (material.map) material.map.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  material.dispose();
}

// Dispose mesh completely
function disposeMesh(mesh) {
  if (mesh.geometry) mesh.geometry.dispose();
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => disposeMaterial(mat));
    } else {
      disposeMaterial(mesh.material);
    }
  }
}
```

---

## Spatial Partitioning

Accelerate raycasting and collision detection with spatial grid.

```javascript
import { SpatialGrid } from './src/pooling/SpatialGrid.js';

// Create grid
const bounds = {
  min: new THREE.Vector3(-50, 0, -50),
  max: new THREE.Vector3(50, 10, 50)
};
const cellSize = 5; // 5x5x5 unit cells

const grid = new SpatialGrid(bounds, cellSize);

// Insert objects
players.forEach(player => {
  grid.insert(player, player.position, player.radius);
});

enemies.forEach(enemy => {
  grid.insert(enemy, enemy.position, enemy.radius);
});

// Query nearby objects
const nearbyObjects = grid.query(position, radius);

// Query along ray (for raycasting)
const rayObjects = grid.queryRay(origin, direction, maxDistance);

// Update object position
grid.update(player, newPosition, player.radius);

// Remove object
grid.remove(enemy);

// Get statistics
grid.logStats();
```

### Optimized Raycasting

```javascript
// Without spatial partitioning (slow)
function raycastAll(origin, direction) {
  const raycaster = new THREE.Raycaster(origin, direction);
  return raycaster.intersectObjects(scene.children, true);
}

// With spatial partitioning (fast)
function raycastOptimized(origin, direction, maxDistance) {
  // Get candidates from grid
  const candidates = grid.queryRay(origin, direction, maxDistance);
  
  // Only raycast against candidates
  const raycaster = new THREE.Raycaster(origin, direction);
  return raycaster.intersectObjects(candidates, false);
}
```

---

## Dynamic Resolution

Automatically adjust rendering resolution to maintain target FPS.

```javascript
import { DynamicResolution } from './src/rendering/DynamicResolution.js';
import * as THREE from 'three';

// Create system
const dynamicRes = new DynamicResolution(renderer, 60); // Target 60 FPS

// Enable
dynamicRes.enable();

// In game loop
dynamicRes.update(frameTime);

// Manual control
dynamicRes.setScale(0.75); // 75% resolution

// Toggle
dynamicRes.toggle();

// Set range
dynamicRes.setRange(0.5, 1.0); // 50% to 100%

// Get stats
const stats = dynamicRes.getStats();
console.log(`Resolution: ${stats.resolution} (${stats.percentage})`);
```

---

## LOD Management

Manage Level of Detail for meshes based on distance.

```javascript
import { LODManager } from './src/rendering/LODManager.js';

// Create manager
const lodManager = new LODManager();

// Set custom distances
lodManager.setDistances(20, 50, 100); // High, medium, low

// Register object with LOD levels
const levels = [
  { distance: 20, mesh: highDetailMesh },
  { distance: 50, mesh: mediumDetailMesh },
  { distance: 100, mesh: lowDetailMesh }
];
lodManager.registerObject(object, levels);

// Or create levels automatically
const levels = lodManager.createLODLevels(highDetailMesh, [20, 50, 100]);
lodManager.registerObject(object, levels);

// Update LOD (call every frame)
lodManager.update(camera.position);

// Using THREE.LOD (alternative)
const lod = lodManager.createThreeLOD(
  [highDetailMesh, mediumDetailMesh, lowDetailMesh],
  [20, 50, 100]
);
scene.add(lod);

// Get statistics
const stats = lodManager.getStats();
console.log(`High detail: ${stats.levels.high}, Medium: ${stats.levels.medium}, Low: ${stats.levels.low}`);
```

---

## Complete Example

Here's a complete example integrating all performance systems:

```javascript
import * as THREE from 'three';
import { metrics } from './performance/metrics.js';
import { memoryManager } from './src/pooling/MemoryManager.js';
import { ProjectilePool, DecalPool, ParticlePool, AudioPool } from './src/pooling/index.js';
import { SpatialGrid } from './src/pooling/SpatialGrid.js';
import { DynamicResolution } from './src/rendering/DynamicResolution.js';
import { LODManager } from './src/rendering/LODManager.js';

class PerformantGame {
  constructor() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    // Performance systems
    this.metrics = metrics;
    this.memoryManager = memoryManager;
    
    // Object pools
    this.projectilePool = new ProjectilePool(this.scene, 50, 500);
    this.decalPool = new DecalPool(this.scene, 100, 500);
    this.particlePool = new ParticlePool(this.scene, 200, 2000);
    
    // Spatial partitioning
    this.spatialGrid = new SpatialGrid(
      { min: new THREE.Vector3(-100, 0, -100), max: new THREE.Vector3(100, 20, 100) },
      10
    );
    
    // Dynamic resolution
    this.dynamicRes = new DynamicResolution(this.renderer, 60);
    this.dynamicRes.enable();
    
    // LOD management
    this.lodManager = new LODManager();
    
    // Register cleanup
    this.memoryManager.onCleanup(() => {
      this.projectilePool.releaseAll();
      this.decalPool.releaseAll();
      this.particlePool.releaseAll();
    });
    
    console.log('Performant game initialized');
  }
  
  // Shoot weapon
  shoot(position, direction) {
    // Spawn projectile from pool
    const projectile = this.projectilePool.spawn(
      position,
      direction,
      50, // speed
      25, // damage
      'player1',
      'ar_mk4'
    );
    
    // Emit muzzle particles
    this.particlePool.emitBurst(position, 10, {
      speed: 3.0,
      lifetime: 0.3,
      color: 0xffaa00
    });
  }
  
  // Handle hit
  onHit(hitPosition, surfaceNormal) {
    // Spawn decal
    this.decalPool.spawn(hitPosition, surfaceNormal);
    
    // Emit impact particles
    this.particlePool.emitBurst(hitPosition, 20, {
      speed: 2.0,
      lifetime: 0.5,
      color: 0x888888
    });
  }
  
  // Update game
  update(deltaTime) {
    // Mark start of logic
    this.metrics.mark('logic-start');
    
    // Update pools
    this.projectilePool.update(deltaTime);
    this.decalPool.update(deltaTime);
    this.particlePool.update(deltaTime);
    
    // Update spatial grid
    this.entities.forEach(entity => {
      this.spatialGrid.update(entity, entity.position, entity.radius);
    });
    
    // Update LOD
    this.lodManager.update(this.camera.position);
    
    // Mark end of logic
    this.metrics.mark('logic-end');
    this.metrics.measure('logic-time', 'logic-start', 'logic-end');
  }
  
  // Render
  render(deltaTime) {
    // Begin frame
    this.metrics.beginFrame();
    
    // Mark render start
    this.metrics.mark('render-start');
    
    // Update dynamic resolution
    this.dynamicRes.update(deltaTime * 1000); // Convert to ms
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Mark render end
    this.metrics.mark('render-end');
    this.metrics.measure('render-time', 'render-start', 'render-end');
    
    // End frame
    this.metrics.endFrame();
  }
  
  // Game loop
  loop(currentTime) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render(deltaTime);
    
    requestAnimationFrame((t) => this.loop(t));
  }
  
  // Start game
  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }
  
  // Cleanup
  dispose() {
    this.projectilePool.dispose();
    this.decalPool.dispose();
    this.particlePool.dispose();
    this.lodManager.dispose();
    this.memoryManager.disposeScene(this.scene);
  }
}

// Usage
const game = new PerformantGame();
game.start();

// Monitor performance
setInterval(() => {
  const snapshot = metrics.getMetrics();
  console.log(`FPS: ${snapshot.fps}, Frame Time: ${snapshot.frameTime.avg}ms`);
  
  const poolStats = game.projectilePool.getStats();
  console.log(`Projectiles: ${poolStats.currentInUse} in use`);
}, 5000);
```

---

## Best Practices

1. **Always use object pooling for temporary objects**
   - Projectiles, particles, decals, audio sources
   - Anything created/destroyed frequently

2. **Track and measure performance**
   - Use performance marks for expensive operations
   - Monitor frame time histogram
   - Set up alerts for GC spikes

3. **Dispose resources properly**
   - Call dispose() on geometries, materials, textures
   - Use MemoryManager for automated cleanup
   - Register cleanup callbacks

4. **Use spatial partitioning**
   - Accelerates collision detection
   - Optimizes raycasting
   - Reduces unnecessary checks

5. **Enable dynamic resolution on low-end devices**
   - Automatically maintains target FPS
   - Provides better experience than dropped frames

6. **Implement LOD for distant objects**
   - Reduces polygon count
   - Improves rendering performance
   - Maintains visual quality where it matters

7. **Monitor and stay within budgets**
   - See performance/budgets.md for targets
   - Use build analyzer to check bundle sizes
   - Profile regularly with Chrome DevTools and Spector.js

---

**Last Updated**: 2025-11-05
**Author**: Performance Team
