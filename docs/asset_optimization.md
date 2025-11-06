# Asset Optimization Guide

This guide covers asset optimization strategies and tools for Arena Blitz FPS.

## Quick Start

```bash
# Initialize asset directories
npm run optimize:assets init

# View optimization instructions
npm run optimize:assets help

# Optimize specific asset types
npm run optimize:textures
npm run optimize:meshes
npm run optimize:atlases

# Optimize all assets
npm run optimize:all
```

## Texture Optimization

### KTX2/Basis Universal Compression

Basis Universal provides high-quality texture compression with small file sizes.

#### Installation

```bash
# Download from GitHub
git clone https://github.com/BinomialLLC/basis_universal.git
cd basis_universal
cmake CMakeLists.txt
make

# Or use pre-built binaries from releases
```

#### Usage

```bash
# Single texture
basisu -comp_level 4 -q 128 input.png -output_file output.basis

# Batch processing
find assets/textures -name "*.png" -exec basisu -comp_level 4 -q 128 {} \;

# High quality (slower, larger)
basisu -comp_level 5 -q 255 input.png -output_file output.basis

# Fast compression (faster, acceptable quality)
basisu -comp_level 2 -q 128 input.png -output_file output.basis
```

#### Loading in Three.js

```javascript
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('path/to/basis_transcoder/');
ktx2Loader.detectSupport(renderer);

ktx2Loader.load('texture.ktx2', (texture) => {
  material.map = texture;
  material.needsUpdate = true;
});
```

### Target Resolutions

- **Desktop**: 2048x2048 max for important textures
- **Mobile**: 1024x1024 max
- **UI Elements**: 2048x2048 atlas
- **Decals**: 512x512 max per decal

### Compression Guidelines

| Texture Type | Format | Quality | Size Reduction |
|--------------|--------|---------|----------------|
| Diffuse Maps | BC7/ASTC | High (q=255) | 4:1 to 8:1 |
| Normal Maps | BC5/ASTC | High (q=255) | 2:1 to 4:1 |
| UI Textures | BC7/ASTC | Very High | 3:1 to 6:1 |
| Environment | ETC1S | Medium (q=128) | 10:1 to 20:1 |

---

## Mesh Optimization

### Draco Compression

Draco provides efficient geometry compression for glTF models.

#### Installation

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Or use Draco CLI tools directly
git clone https://github.com/google/draco.git
cd draco
cmake .
make
```

#### Usage with gltf-pipeline

```bash
# Compress single model
gltf-pipeline -i model.glb -o model-draco.glb -d

# With custom compression level (0-10)
gltf-pipeline -i model.glb -o model-draco.glb -d --draco.compressionLevel=7

# Preserve normals and UVs
gltf-pipeline -i model.glb -o model-draco.glb -d --draco.quantizePositionBits=14

# Batch processing
find assets/models -name "*.glb" -exec gltf-pipeline -i {} -o {}-draco.glb -d \;
```

#### Loading in Three.js

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('path/to/draco_decoder/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('model-draco.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### Polygon Budgets

| Asset Type | LOD 0 | LOD 1 | LOD 2 |
|------------|-------|-------|-------|
| Character | 15k-25k | 8k-12k | 3k-5k |
| Weapon | 8k-15k | 3k-6k | 1k-3k |
| Prop (Large) | 5k-10k | 2k-5k | 500-2k |
| Prop (Small) | 2k-5k | 500-2k | 100-500 |

### Mesh Simplification

```bash
# Using Blender Python
blender model.blend --background --python simplify.py

# simplify.py
import bpy
obj = bpy.context.active_object
modifier = obj.modifiers.new(name="Decimate", type='DECIMATE')
modifier.ratio = 0.5  # 50% of original faces
bpy.ops.object.modifier_apply(modifier="Decimate")
bpy.ops.export_scene.gltf(filepath="model_lod1.glb")
```

---

## Sprite Atlas Generation

Combine multiple small textures into larger atlases to reduce draw calls.

### Using TexturePacker (Commercial)

```bash
# CLI usage
TexturePacker --format pixijs --data ui-atlas.json --sheet ui-atlas.png sprites/*.png
```

### Using spritesheet-js (Free)

```bash
# Install
npm install -g spritesheet-js

# Generate atlas
spritesheet-js assets/sprites/*.png -f json -n ui-atlas --padding 2 --trim

# Output: ui-atlas.png, ui-atlas.json
```

### Manual Atlas with Canvas

```javascript
// Create atlas at build time
const canvas = document.createElement('canvas');
canvas.width = 2048;
canvas.height = 2048;
const ctx = canvas.getContext('2d');

const sprites = [
  { name: 'icon1', img: loadImage('icon1.png'), x: 0, y: 0 },
  { name: 'icon2', img: loadImage('icon2.png'), x: 64, y: 0 },
  // ... more sprites
];

sprites.forEach(sprite => {
  ctx.drawImage(sprite.img, sprite.x, sprite.y);
});

// Save atlas
const dataURL = canvas.toDataURL('image/png');
```

### Using Atlas in Three.js

```javascript
import * as THREE from 'three';

// Load atlas
const texture = textureLoader.load('ui-atlas.png');

// Define sprite regions
const sprites = {
  icon1: { x: 0, y: 0, width: 64, height: 64 },
  icon2: { x: 64, y: 0, width: 64, height: 64 }
};

// Use sprite from atlas
const sprite = sprites.icon1;
material.map = texture;
material.map.offset.set(sprite.x / 2048, sprite.y / 2048);
material.map.repeat.set(sprite.width / 2048, sprite.height / 2048);
```

---

## Audio Optimization

### Compression Formats

- **Background Music**: Streaming MP3/OGG at 192kbps max
- **Sound Effects**: 128kbps MP3/OGG
- **One-shots**: < 5 seconds duration
- **Loops**: Seamless loop points

### Batch Conversion with FFmpeg

```bash
# Install FFmpeg
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg          # macOS

# Convert to OGG
ffmpeg -i input.wav -c:a libvorbis -q:a 4 output.ogg

# Batch processing
find assets/audio -name "*.wav" -exec ffmpeg -i {} -c:a libvorbis -q:a 4 {}.ogg \;

# Normalize volume
ffmpeg -i input.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" output.ogg
```

### Audio Pool Management

```javascript
import { AudioPool } from './src/pooling/AudioPool.js';

const audioContext = new AudioContext();
const audioPool = new AudioPool(audioContext, 20, 100);

// Preload buffers
const buffers = {};
async function loadSound(name, url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  buffers[name] = await audioContext.decodeAudioData(arrayBuffer);
}

// Play from pool
function playSound(name, options) {
  const buffer = buffers[name];
  if (buffer) {
    return audioPool.play(buffer, options);
  }
}
```

---

## Build-Time Optimization

### Vite Asset Pipeline

The project's `vite.config.js` already includes:
- Code splitting by module type
- Brotli and Gzip compression
- Bundle analysis
- Terser minification

### Additional Optimizations

```javascript
// vite.config.js additions

export default defineConfig({
  build: {
    // Asset inline threshold
    assetsInlineLimit: 4096, // 4KB
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    rollupOptions: {
      output: {
        // Asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  }
});
```

---

## Asset Loading Strategies

### Lazy Loading

```javascript
// Load maps on demand
const loadMap = async (mapName) => {
  const mapModule = await import(`./maps/${mapName}.js`);
  return mapModule.default;
};

// Load weapons on demand
const loadWeapon = async (weaponId) => {
  const weaponModule = await import(`./weapons/${weaponId}.js`);
  return weaponModule.default;
};
```

### Progressive Loading

```javascript
// Priority-based asset loading
const assetPriorities = {
  critical: ['player-model.glb', 'ui-atlas.png'],
  high: ['map-geometry.glb', 'weapon-models.glb'],
  medium: ['environment-textures.ktx2'],
  low: ['decorative-props.glb']
};

async function loadAssets() {
  // Load critical first
  await Promise.all(
    assetPriorities.critical.map(asset => loadAsset(asset))
  );
  
  // Then high priority
  await Promise.all(
    assetPriorities.high.map(asset => loadAsset(asset))
  );
  
  // Load others in background
  assetPriorities.medium.forEach(asset => loadAsset(asset));
  assetPriorities.low.forEach(asset => loadAsset(asset));
}
```

### Texture Streaming

```javascript
import { LoadingManager } from 'three';

const manager = new LoadingManager();
let loadedCount = 0;
let totalCount = 0;

manager.onStart = (url, loaded, total) => {
  totalCount = total;
  console.log(`Started loading: ${url}`);
};

manager.onProgress = (url, loaded, total) => {
  loadedCount = loaded;
  const progress = (loaded / total) * 100;
  updateProgressBar(progress);
};

manager.onLoad = () => {
  console.log('All assets loaded');
};

const textureLoader = new THREE.TextureLoader(manager);
```

---

## Validation and Testing

### Check Asset Sizes

```bash
# Find large textures
find assets/textures -name "*.png" -size +1M -exec ls -lh {} \;

# Find large models
find assets/models -name "*.glb" -size +5M -exec ls -lh {} \;

# Total asset size
du -sh assets/
```

### Bundle Size Analysis

```bash
# Build and analyze
npm run build

# Open stats.html in browser
open dist/stats.html
```

### Performance Validation

- Desktop target: 60 FPS with < 1000 draw calls
- Mobile target: 30 FPS with < 400 draw calls
- Initial bundle: < 1.5MB gzipped
- Texture memory: < 512MB desktop, < 256MB mobile

---

## Automation Scripts

### Complete Asset Pipeline

```bash
#!/bin/bash
# optimize-all.sh

echo "Optimizing textures..."
find assets/textures -name "*.png" | while read file; do
  basisu -comp_level 4 -q 128 "$file" -output_file "${file%.png}.basis"
done

echo "Optimizing meshes..."
find assets/models -name "*.glb" | while read file; do
  gltf-pipeline -i "$file" -o "${file%.glb}-draco.glb" -d
done

echo "Generating atlases..."
spritesheet-js assets/sprites/ui/*.png -f json -n ui-atlas --padding 2
spritesheet-js assets/sprites/decals/*.png -f json -n decal-atlas --padding 1

echo "Converting audio..."
find assets/audio -name "*.wav" | while read file; do
  ffmpeg -i "$file" -c:a libvorbis -q:a 4 "${file%.wav}.ogg"
done

echo "Done!"
```

### CI/CD Integration

```yaml
# .github/workflows/optimize-assets.yml
name: Optimize Assets

on:
  push:
    paths:
      - 'assets/**'

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install tools
        run: |
          npm install -g gltf-pipeline
          # Install basisu, etc.
      
      - name: Optimize assets
        run: npm run optimize:all
      
      - name: Commit optimized assets
        run: |
          git add assets/
          git commit -m "Optimize assets [skip ci]"
          git push
```

---

## Resources

- [Basis Universal](https://github.com/BinomialLLC/basis_universal)
- [Draco Compression](https://github.com/google/draco)
- [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline)
- [TexturePacker](https://www.codeandweb.com/texturepacker)
- [Three.js Loaders](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

---

**Last Updated**: 2025-11-05
**Maintainer**: Performance Team
