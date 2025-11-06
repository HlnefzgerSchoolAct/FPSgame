# Performance Profiling Guide

This guide provides step-by-step instructions for profiling and optimizing Arena Blitz FPS performance.

## Table of Contents
1. [Built-in Performance Metrics](#built-in-performance-metrics)
2. [Chrome DevTools Profiling](#chrome-devtools-profiling)
3. [Spector.js for WebGL Analysis](#spectorjs-for-webgl-analysis)
4. [Memory Profiling](#memory-profiling)
5. [Network Profiling](#network-profiling)
6. [Bundle Analysis](#bundle-analysis)
7. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Built-in Performance Metrics

Arena Blitz includes a built-in performance monitoring system with real-time metrics.

### Enabling Stats Overlay

The stats overlay is enabled by default in development mode.

```javascript
// In your main.js or Game.js
import { metrics } from './performance/metrics.js';

// Stats.js overlay will show automatically
// Top-left corner shows FPS, frame time, and memory
```

### Accessing Metrics Programmatically

```javascript
import { metrics } from './performance/metrics.js';

// Get current metrics snapshot
const snapshot = metrics.getMetrics();
console.log(snapshot);
/*
{
  fps: 60,
  frameTime: { current: "12.34", avg: "13.21", min: "10.12", max: "45.67" },
  histogram: { "0-8": 120, "8-16": 540, "16-33": 20, "33-50": 5, "50+": 2 },
  gc: { events: 3, lastGC: 12345.67, recentSpikes: [...] },
  memory: { js: "245.32 MB", jsLimit: "512.00 MB", gpu: "387.45 MB" },
  network: { latency: "45 ms", throughputIn: "12.34 KB/s", throughputOut: "8.21 KB/s" }
}
*/

// Log metrics to console
metrics.logMetrics();
```

### Custom Performance Marks

Track specific operations using Performance API marks:

```javascript
import { metrics } from './performance/metrics.js';

// Mark start of operation
metrics.mark('map-load-start');

// ... load map assets ...

// Mark end of operation
metrics.mark('map-load-end');

// Measure duration
const duration = metrics.measure('map-load', 'map-load-start', 'map-load-end');
console.log(`Map loaded in ${duration}ms`);
```

### Frame Time Histogram

View frame time distribution to identify performance patterns:

```javascript
const snapshot = metrics.getMetrics();
console.table(snapshot.histogram);
/*
┌─────────┬───────┐
│ (index) │Values │
├─────────┼───────┤
│  0-8    │  120  │  <-- Excellent (>120fps)
│  8-16   │  540  │  <-- Good (60-120fps)
│ 16-33   │  20   │  <-- Acceptable (30-60fps)
│ 33-50   │  5    │  <-- Poor (20-30fps)
│  50+    │  2    │  <-- Very Poor (<20fps)
└─────────┴───────┘
*/
```

---

## Chrome DevTools Profiling

### Performance Panel

1. **Open DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. **Navigate to Performance tab**
3. **Start Recording**: Click the record button (⚫) or press `Ctrl+E`
4. **Perform Actions**: Play the game, trigger the scenario you want to profile
5. **Stop Recording**: Click stop button or press `Ctrl+E` again

#### Analyzing the Recording

**Main Thread Activity**:
- Look for long tasks (> 50ms) shown in red
- Identify JavaScript functions consuming the most time
- Check for layout thrashing and forced reflows

**GPU Activity**:
- Monitor rendering and painting operations
- Look for expensive draw calls
- Identify texture uploads and shader compilation

**Frame Rate**:
- Green bars indicate good frame rate (60 FPS)
- Yellow/red bars indicate dropped frames
- Aim for consistent green bars

### JavaScript Profiler

1. **Open DevTools** → **Performance** tab
2. Click **Record** and reproduce the performance issue
3. Stop recording and examine:
   - **Bottom-Up view**: Find most expensive functions
   - **Call Tree view**: See call hierarchy
   - **Event Log**: Timeline of all events

#### Focus on Hot Paths

Look for:
- Functions called frequently (>100 times per second)
- Functions with high self-time
- Unnecessary object allocations in loops

```javascript
// Bad: Creates new objects every frame
function update(deltaTime) {
  const velocity = new THREE.Vector3(x, y, z); // ❌ Allocation in hot path
}

// Good: Reuse objects
const velocity = new THREE.Vector3();
function update(deltaTime) {
  velocity.set(x, y, z); // ✅ No allocation
}
```

---

## Spector.js for WebGL Analysis

Spector.js is essential for analyzing WebGL/Three.js rendering performance.

### Installation

#### Browser Extension (Recommended)

1. Install Spector.js extension:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/spector-js/)

2. Click the Spector.js icon in browser toolbar
3. Click "Capture" to record a frame

#### Standalone Library

```html
<!-- Add to index.html for development -->
<script src="https://spectorcdn.babylonjs.com/spector.bundle.js"></script>
<script>
  const spector = new SPECTOR.Spector();
  spector.displayUI();
</script>
```

### Capturing a Frame

1. **Open the game** in your browser
2. **Click Spector.js icon** → **Capture**
3. **Select canvas** (game-canvas)
4. A new tab opens with the captured frame

### Analyzing Draw Calls

#### Draw Call List
- Shows all WebGL draw calls in order
- Click on any draw call to see details
- Look for redundant or expensive calls

#### Key Metrics to Monitor

**Draw Calls Count**:
- Desktop target: < 1000 during combat
- Mobile target: < 400 during combat
- Each draw call has overhead

**Texture Bindings**:
- Excessive texture switches are expensive
- Use texture atlases to reduce switches
- Batch objects with same material

**Shader Programs**:
- Shader switching is expensive
- Minimize unique materials
- Reuse materials across objects

**Buffer Updates**:
- Frequent buffer updates cause stalls
- Use object pooling to avoid recreating buffers
- Update only changed vertices

### Common WebGL Bottlenecks

#### Too Many Draw Calls
```javascript
// Bad: Individual draw calls for each object
scene.add(mesh1); // Draw call 1
scene.add(mesh2); // Draw call 2
scene.add(mesh3); // Draw call 3

// Good: Use instancing for repeated geometry
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
scene.add(instancedMesh); // Single draw call
```

#### Texture Thrashing
```javascript
// Bad: Many unique textures
const texture1 = textureLoader.load('texture1.png');
const texture2 = textureLoader.load('texture2.png');
const texture3 = textureLoader.load('texture3.png');

// Good: Use texture atlas
const atlas = textureLoader.load('sprite-atlas.png');
// Use UV coordinates to access different sprites
```

#### Expensive Shaders
- Minimize texture lookups in fragment shader
- Avoid branching (if/else) in shaders
- Precalculate values when possible
- Use simpler materials for distant objects (LOD)

---

## Memory Profiling

### Memory Panel

1. **Open DevTools** → **Memory** tab
2. **Take Heap Snapshot**
3. **Perform actions** (load map, shoot, etc.)
4. **Take another snapshot**
5. **Compare snapshots** to find leaks

### Identifying Memory Leaks

#### Three.js Resource Disposal

Three.js requires manual disposal of resources:

```javascript
// Dispose geometry
geometry.dispose();

// Dispose material
material.dispose();

// Dispose texture
texture.dispose();

// Dispose entire mesh
function disposeMesh(mesh) {
  if (mesh.geometry) mesh.geometry.dispose();
  
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => mat.dispose());
    } else {
      mesh.material.dispose();
    }
  }
  
  // Dispose textures
  if (mesh.material.map) mesh.material.map.dispose();
  if (mesh.material.normalMap) mesh.material.normalMap.dispose();
  if (mesh.material.roughnessMap) mesh.material.roughnessMap.dispose();
}
```

#### Common Memory Leaks

**Not Disposing Resources**:
```javascript
// ❌ Memory leak: geometry never disposed
function createBullet() {
  const geometry = new THREE.SphereGeometry(0.1);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

// ✅ Use pooling instead
const bulletPool = new ProjectilePool(scene, 100);
const bullet = bulletPool.acquire();
```

**Event Listeners Not Removed**:
```javascript
// ❌ Memory leak: listeners never removed
window.addEventListener('keydown', handleKeyDown);

// ✅ Clean up listeners
const cleanup = () => {
  window.removeEventListener('keydown', handleKeyDown);
};
```

**Circular References**:
```javascript
// ❌ Memory leak: circular reference
const player = { weapon: null };
const weapon = { owner: player };
player.weapon = weapon; // Circular reference

// ✅ Use weak references or null when done
player.weapon = null;
```

### GPU Memory Tracking

```javascript
import { metrics } from './performance/metrics.js';

// Track GPU memory usage
function calculateGPUMemory() {
  let textureMemory = 0;
  let geometryMemory = 0;
  
  scene.traverse((object) => {
    if (object.geometry) {
      geometryMemory += estimateGeometrySize(object.geometry);
    }
    
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(mat => {
        if (mat.map) textureMemory += estimateTextureSize(mat.map);
        if (mat.normalMap) textureMemory += estimateTextureSize(mat.normalMap);
      });
    }
  });
  
  metrics.trackGPUMemory(textureMemory, geometryMemory);
}

function estimateTextureSize(texture) {
  const { width, height } = texture.image || { width: 0, height: 0 };
  return width * height * 4; // RGBA8
}

function estimateGeometrySize(geometry) {
  let size = 0;
  const attributes = geometry.attributes;
  for (let key in attributes) {
    size += attributes[key].array.byteLength;
  }
  return size;
}
```

---

## Network Profiling

### Network Panel

1. **Open DevTools** → **Network** tab
2. **Reload page** to capture initial load
3. **Monitor WebSocket traffic** for real-time game data

### Key Metrics

- **Initial Bundle Size**: Target < 1.5MB gzipped
- **WebSocket Message Size**: Target < 500 bytes per snapshot
- **Message Frequency**: 20 Hz client updates, 60 Hz server snapshots
- **Latency**: Target < 50ms RTT

### Optimizing Network Traffic

#### Delta Compression

```javascript
// Instead of sending full state every frame
const fullState = {
  position: { x: 10, y: 0, z: 5 },
  rotation: { x: 0, y: 1.57, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  health: 100
};

// Send only what changed
const delta = {
  p: [10, 0, 5], // Position changed
  // Omit unchanged fields
};
```

#### MessagePack vs JSON

```javascript
// JSON (verbose)
JSON.stringify({ position: { x: 10, y: 0, z: 5 } }); // ~35 bytes

// MessagePack (compact)
msgpack.encode({ p: [10, 0, 5] }); // ~8 bytes
```

---

## Bundle Analysis

### Visualizing Bundle Size

After production build:

```bash
npm run build
```

Open `dist/stats.html` in browser to see:
- Bundle composition
- Largest dependencies
- Gzipped sizes
- Code splitting effectiveness

### Analyzing Output

**Look for**:
- Unexpectedly large chunks
- Duplicate dependencies
- Unused code that wasn't tree-shaken
- Opportunities for code splitting

### Optimization Actions

**Code Splitting**:
```javascript
// Lazy load maps
const loadMap = async (mapName) => {
  const mapModule = await import(`./maps/${mapName}.js`);
  return mapModule.default;
};
```

**Tree Shaking**:
```javascript
// ❌ Imports entire library
import * as THREE from 'three';

// ✅ Import only what's needed
import { Vector3, Mesh, Scene } from 'three';
```

**Dynamic Imports**:
```javascript
// Load on demand
button.addEventListener('click', async () => {
  const { HeavyFeature } = await import('./heavy-feature.js');
  new HeavyFeature().init();
});
```

---

## Common Issues and Solutions

### Issue: Low FPS (< 60 FPS on desktop)

**Diagnosis**:
1. Check frame time in stats overlay
2. Profile with Chrome DevTools Performance
3. Capture frame with Spector.js

**Common Causes**:
- Too many draw calls → Use instancing, merge geometries
- Expensive shaders → Simplify materials, use LODs
- No frustum culling → Enable Three.js frustum culling
- Heavy JavaScript in game loop → Move to requestIdleCallback or Web Worker

### Issue: GC Spikes (> 10ms pauses)

**Diagnosis**:
1. Check GC events in metrics
2. Profile memory in Chrome DevTools

**Common Causes**:
- Object allocation in hot paths → Use object pooling
- Creating new Vector3/Quaternion objects → Reuse instances
- String concatenation → Use template literals sparingly
- Array operations → Preallocate and reuse arrays

### Issue: High Memory Usage

**Diagnosis**:
1. Take heap snapshots in Chrome DevTools
2. Check GPU memory in metrics
3. Look for detached DOM nodes

**Common Causes**:
- Not disposing Three.js resources → Implement disposal patterns
- Loading too many textures → Use texture atlases, unload unused
- Memory leaks → Remove event listeners, break circular references
- Large geometry buffers → Use Draco compression, LODs

### Issue: Slow Initial Load

**Diagnosis**:
1. Check Network panel for bundle sizes
2. Analyze dist/stats.html for bundle composition
3. Check asset compression

**Common Causes**:
- Large initial bundle → Use code splitting, lazy loading
- Uncompressed assets → Enable Brotli/Gzip in vite.config.js
- Blocking resources → Use async/defer for scripts
- Too many dependencies → Audit and remove unused packages

### Issue: Network Lag

**Diagnosis**:
1. Check network latency in metrics
2. Monitor WebSocket message sizes
3. Analyze message frequency

**Common Causes**:
- Large snapshot payloads → Use delta compression, MessagePack
- Too frequent updates → Reduce update rate, throttle
- No client prediction → Implement prediction/reconciliation
- Sending unnecessary data → Cull invisible entities, quantize values

---

## Performance Checklist

Before committing changes, verify:

- [ ] FPS >= 60 on mid-spec desktop
- [ ] FPS >= 30 on mid-tier mobile
- [ ] Frame time < 16ms average
- [ ] No GC spikes > 10ms
- [ ] Draw calls < 1000 (desktop) / 400 (mobile)
- [ ] GPU memory < 512MB (desktop) / 256MB (mobile)
- [ ] Initial bundle < 1.5MB gzipped
- [ ] No memory leaks (stable memory over time)
- [ ] Three.js resources properly disposed
- [ ] Object pools used for temporary objects

---

## Resources

- [Three.js Performance Tips](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Spector.js Documentation](https://spector.babylonjs.com/)
- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

**Last Updated**: 2025-11-05
**Maintainer**: Performance Team
