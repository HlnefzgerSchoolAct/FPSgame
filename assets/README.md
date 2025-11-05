# Assets Directory

This directory contains all game assets for the Arena Blitz FPS game.

## Structure

```
assets/
├── models/
│   ├── weapons/     # Weapon viewmodels (.glb)
│   └── characters/  # Player and NPC models (.glb)
├── maps/            # Map environment assets
├── textures/        # Texture atlases and materials
└── ui/              # UI sprites and icons
```

## Asset Guidelines

### Models

**Format**: glTF 2.0 (.glb) with Draco compression

**Weapon Models**:
- Max triangles: 5,000 (first-person viewmodel)
- Texture resolution: 2048x2048 (albedo, normal, metalness, roughness)
- Include muzzle socket for effects positioning
- Optimize for mobile: Remove unnecessary details

**Character Models**:
- Max triangles: 10,000 (LOD0), 5,000 (LOD1), 2,000 (LOD2)
- Texture resolution: 2048x2048
- Rigged with standard humanoid skeleton
- Include facial blend shapes for customization

### Textures

**Format**: KTX2 with Basis Universal compression

**Compression Settings**:
- UASTC for high-quality textures (normal maps)
- ETC1S for color textures (albedo)
- BC7 for desktop, ASTC for mobile

**Texture Types**:
- Albedo (sRGB color space)
- Normal (linear, BC5/ETC2)
- Metalness (linear, single channel)
- Roughness (linear, single channel)
- AO (linear, single channel)

### Maps

**Environment Assets**:
- Use GPU instancing for repeated props
- Bake lighting into lightmaps where possible
- Occlusion volumes for performance

**Collision Geometry**:
- Separate simplified meshes for physics
- Store in map JSON, not as separate assets

### UI

**Format**: PNG with transparency or SVG

**Sprites**:
- Crosshairs: 64x64
- Icons: 128x128
- HUD elements: 256x256 or 512x512
- Use texture atlases to reduce draw calls

## Current Status

**Placeholder Assets**: The rendering system currently generates all geometry procedurally using Three.js primitives (boxes, cylinders, planes).

**Production Ready**: To make this production-ready, create or import:
1. 10 weapon models (see data/weapons/weapons.json)
2. 2 character models (player and enemy)
3. 2 map environments (arena_hub and shipyard)
4. UI sprites and icons

## Asset Pipeline

### Recommended Workflow

1. **Modeling**: Blender 3.x with glTF exporter
2. **Texturing**: Substance Painter or Quixel Mixer
3. **Compression**: gltfpack for Draco, toktx for KTX2
4. **Testing**: Load in game and check performance

### Export Settings (Blender)

```
Format: glTF Binary (.glb)
✓ Apply Modifiers
✓ UVs
✓ Normals
✓ Tangents
✓ Materials: Export
✓ Compression: Draco
  - Position: 14 bits
  - Normal: 10 bits
  - UV: 12 bits
```

### Texture Compression (toktx)

```bash
# Albedo (sRGB)
toktx --uastc --uastc_quality 4 --zcmp 5 albedo.ktx2 albedo.png

# Normal (linear)
toktx --uastc --uastc_quality 4 --zcmp 5 --linear normal.ktx2 normal.png

# Metalness/Roughness (linear, combined)
toktx --uastc --uastc_quality 2 --zcmp 5 --linear metal_rough.ktx2 metal_rough.png
```

## Asset Budget

### Per-Map Budget
- Total triangles: 500k-1M
- Total textures: 100-150 MB compressed
- Draw calls: < 100

### Weapon Budget (First-Person)
- Triangles: 5,000 max
- Textures: 8 MB per weapon (2048x2048 x 4 maps, compressed)

### Character Budget
- Triangles: 10k (LOD0), 5k (LOD1), 2k (LOD2)
- Textures: 8 MB per character

## Performance Targets

- **Desktop**: 60 FPS @ 1080p
- **Mobile**: 30 FPS @ 720p
- **Loading**: < 3 seconds per map
- **Memory**: < 500 MB total

## Attribution

When adding assets, include attribution in this section:

- Asset Name - Creator Name - License
- (Example) MK-4 Rifle - John Doe - CC BY 4.0
