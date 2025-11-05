# Three.js Rendering System

High-performance WebGL/Three.js rendering system for Arena Blitz FPS game.

## Architecture

### Core Components

- **Renderer.js** - Main Three.js WebGL renderer with dual-camera setup
- **RenderSystem.js** - Coordinator that integrates all rendering subsystems
- **SceneManager.js** - Map loading, lighting, LOD management
- **FirstPersonRig.js** - Weapon viewmodel with sway, bob, and ADS animations

### Effects System

Located in `Effects/`:
- **MuzzleFlash.js** - Muzzle flash particles with pooling
- **BulletTracer.js** - Visible bullet trails
- **ImpactDecals.js** - Bullet holes with automatic cleanup
- **BloodFX.js** - Blood splatter particles
- **HitMarkerFX.js** - Hit confirmation markers
- **DamageVignette.js** - Screen vignette on damage

### Post-Processing

Located in `Post/`:
- **PostProcessing.js** - Bloom, color grading, FXAA support

### Shaders

Located in `../shaders/`:
- `muzzle_flash.frag` - Muzzle flash effect
- `screen_vignette.frag` - Damage vignette
- `color_grade.frag` - Color correction
- `instanced_decal.frag` - GPU-instanced decals

## Features

### Dual Camera System

The rendering system uses two separate cameras to avoid weapon clipping:

1. **World Camera** - Renders the game world, players, and environment
   - FOV: 75°
   - Near plane: 0.1m
   - Far plane: 1000m

2. **Weapon Camera** - Renders only the first-person weapon viewmodel
   - FOV: 60°
   - Near plane: 0.01m (very close to avoid clipping)
   - Far plane: 10m (only renders weapon)

This approach is industry-standard and used in games like Call of Duty, Battlefield, etc.

### Performance Optimizations

- **GPU Instancing** - Repeated props use instanced meshes
- **Object Pooling** - Effects reuse objects instead of creating new ones
- **LOD System** - Level-of-detail for distant objects
- **Frustum Culling** - Automatic via Three.js
- **Quality Presets** - Low/Medium/High quality settings
- **Dynamic Resolution** - Can scale resolution based on performance

### Quality Settings

```javascript
renderSystem.setQuality('low');    // Fastest, no bloom, basic shadows
renderSystem.setQuality('medium'); // Balanced, bloom enabled
renderSystem.setQuality('high');   // Best quality, PCF soft shadows
```

## Integration with Game Systems

### Animation Hooks

The render system subscribes to animation events from the gameplay system:

```javascript
// Fired when weapon shoots
game.animationHooks.on('anim:muzzle:flash', (data) => {
  renderSystem.createMuzzleFlash(data.position, data.direction, data.weaponType);
});
```

### Hit Detection

Visual feedback is created automatically when hits are detected:

```javascript
// In Game.js _performHitScan()
if (hit) {
  renderSystem.createImpactDecal(hit.point, hit.normal, 'bullet');
  renderSystem.createHitMarker(hit.point, hit.isHeadshot);
  if (hit.targetId) {
    renderSystem.createBloodEffect(hit.point, direction);
  }
}
```

### Camera Synchronization

The render system's cameras are updated every frame with player position and rotation:

```javascript
const cameraState = {
  position: { x, y, z },  // Player position
  rotation: { x, y, z }   // Camera pitch/yaw/roll
};

renderSystem.update(deltaTime, cameraState, weaponState, gameState);
```

## Map Loading

Maps are loaded from JSON files in `data/maps/`:

```javascript
await renderSystem.loadMap('arena_hub');
```

The map loader:
1. Parses map JSON (dimensions, layout, spawn points)
2. Creates environment (ground, fog, background)
3. Sets up lighting based on time of day
4. Generates geometry for lanes and cover
5. Creates spawn zone and objective markers

### Spawn Points

```javascript
const spawnPoints = renderSystem.getSpawnPoints('team_a');
// Returns: [{ id, position, radius, facing }, ...]
```

### Objective Locations

```javascript
const objectives = renderSystem.getObjectiveLocations('koth');
// Returns: [{ id, position, radius }, ...]
```

## Performance Targets

- **Desktop**: 60 FPS with 6-12 players
- **Mobile**: 30+ FPS with reduced quality
- **Draw Calls**: < 100 per frame (via instancing)
- **Triangles**: ~50k-200k depending on scene complexity

## Memory Management

All effects and objects are properly disposed when no longer needed:

```javascript
// Decals auto-fade and dispose after 30 seconds
// Pooled effects return to pool for reuse
// Scene changes trigger full cleanup

renderSystem.dispose(); // Clean shutdown
```

## Asset Pipeline

### Current (Placeholder)

The system currently generates placeholder geometry procedurally:
- Simple box/cylinder shapes for weapons
- Colored boxes for cover objects
- Planes for ground and lanes

### Future (Production)

For production, integrate with asset loaders:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// In FirstPersonRig.loadWeapon()
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
loader.setDRACOLoader(dracoLoader);

loader.load(`/assets/models/weapons/${weaponId}.glb`, (gltf) => {
  this.weaponMesh = gltf.scene;
  // ... setup muzzle socket, etc.
});
```

### Recommended Asset Formats

- **Models**: glTF 2.0 (.glb) with Draco compression
- **Textures**: KTX2 with Basis Universal compression
- **Normal Maps**: BC5/ETC2 for better quality
- **Texture Resolution**: 2048x2048 for weapons, 512x512 for UI

## Stats.js Integration

The render system supports Stats.js for performance monitoring:

```javascript
import Stats from 'stats.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

renderSystem.renderer.setStatsPanel(stats);
```

## Spector.js Integration

For WebGL debugging, the renderer detects Spector.js automatically:

```javascript
// In browser console
var spector = new SPECTOR.Spector();
spector.displayUI();
```

## Testing

Run the development server:

```bash
npm run dev
```

Open http://localhost:8080 and click "Start Game" to see the 3D rendering in action.

## Troubleshooting

### Black screen
- Check browser console for WebGL errors
- Verify Three.js is loaded: `console.log(THREE)`
- Check camera position is not inside geometry

### Low FPS
- Reduce quality setting: `renderSystem.setQuality('low')`
- Check number of draw calls: `renderSystem.getStats()`
- Disable bloom: `renderSystem.postProcessing.setBloom(false)`

### Weapon not visible
- Verify weapon camera near plane (0.01m)
- Check weapon rig position (should be in front of camera)
- Confirm weapon mesh is added to weapon scene

### Effects not showing
- Check effect is created with valid position/direction
- Verify effect lifetime hasn't expired
- Confirm scene contains the effect objects

## API Reference

See `RenderSystem.js` for complete API documentation.

### Key Methods

- `init()` - Initialize the rendering system
- `loadMap(mapId)` - Load a map
- `loadWeapon(weaponId)` - Load weapon viewmodel
- `update(dt, cameraState, weaponState, gameState)` - Update per frame
- `render(dt)` - Render the scene
- `createMuzzleFlash(pos, dir, type)` - Create muzzle flash
- `createBulletTracer(start, end, color)` - Create tracer
- `createImpactDecal(pos, normal, type)` - Create decal
- `setQuality(quality)` - Change quality preset
- `dispose()` - Clean up resources
