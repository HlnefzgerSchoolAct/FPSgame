# Material Presets

Standard material configurations for the Arena Blitz FPS game.

## PBR Materials

All materials use Physically Based Rendering (PBR) workflow with:
- Albedo (base color)
- Metalness (0 = dielectric, 1 = metal)
- Roughness (0 = smooth, 1 = rough)
- Normal map (for surface detail)
- Ambient Occlusion (for crevices)

## Material Presets

### Weapon Materials

```javascript
// Metal (gun barrels, slides)
const weaponMetal = new THREE.MeshStandardMaterial({
  color: 0x222222,
  metalness: 0.9,
  roughness: 0.3,
  envMapIntensity: 1.0
});

// Polymer (grips, stocks)
const weaponPolymer = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  metalness: 0.1,
  roughness: 0.7,
  envMapIntensity: 0.5
});

// Wood (stocks, grips)
const weaponWood = new THREE.MeshStandardMaterial({
  color: 0x4a2511,
  metalness: 0.0,
  roughness: 0.8,
  envMapIntensity: 0.3
});
```

### Environment Materials

```javascript
// Concrete (walls, floors)
const concrete = new THREE.MeshStandardMaterial({
  color: 0x808080,
  metalness: 0.0,
  roughness: 0.9,
  envMapIntensity: 0.2
});

// Metal (catwalks, containers)
const industrialMetal = new THREE.MeshStandardMaterial({
  color: 0x555555,
  metalness: 0.8,
  roughness: 0.5,
  envMapIntensity: 0.8
});

// Ground (dirt, asphalt)
const ground = new THREE.MeshStandardMaterial({
  color: 0x2c2c2c,
  metalness: 0.0,
  roughness: 1.0,
  envMapIntensity: 0.1
});
```

### Character Materials

```javascript
// Skin
const skin = new THREE.MeshStandardMaterial({
  color: 0xffdbac,
  metalness: 0.0,
  roughness: 0.6,
  envMapIntensity: 0.3,
  // Use subsurface scattering for better skin rendering
});

// Fabric (uniforms, clothing)
const fabric = new THREE.MeshStandardMaterial({
  color: 0x1a4d2e,
  metalness: 0.0,
  roughness: 0.9,
  envMapIntensity: 0.2
});

// Tactical Gear (vests, pouches)
const tacticalGear = new THREE.MeshStandardMaterial({
  color: 0x3a3a3a,
  metalness: 0.1,
  roughness: 0.8,
  envMapIntensity: 0.4
});
```

### UI/HUD Materials

```javascript
// Unlit for UI elements (no lighting)
const hudElement = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.9,
  blending: THREE.NormalBlending,
  depthWrite: false
});

// Decals (bullet holes, blood)
const decal = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.8,
  blending: THREE.MultiplyBlending,
  depthWrite: false
});

// Additive for glows and effects
const glow = new THREE.MeshBasicMaterial({
  color: 0xffaa00,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
```

## Colorblind-Safe Palette

To ensure readability for colorblind players:

```javascript
// Team Colors
const teamColors = {
  friendly: 0x00a8ff,  // Blue (safe for all types)
  enemy: 0xff9500,     // Orange (safe for all types)
  neutral: 0xf0f0f0    // White/gray
};

// UI Colors
const uiColors = {
  health: 0x00ff00,    // Green
  damage: 0xff0000,    // Red
  shield: 0x00a8ff,    // Blue
  energy: 0xffaa00,    // Yellow/orange
  objective: 0xff00ff  // Magenta
};
```

### Color Vision Deficiency Testing

Test with these color combinations:
- Protanopia (red-blind): Avoid red/green
- Deuteranopia (green-blind): Avoid red/green
- Tritanopia (blue-blind): Avoid blue/yellow

Use tools like:
- Coblis Color Blindness Simulator
- Color Oracle
- Chrome DevTools color vision simulation

## Readability Guidelines

### Contrast Ratios

For UI text and elements:
- **Minimum**: 4.5:1 (WCAG AA)
- **Recommended**: 7:1 (WCAG AAA)

For crosshairs and critical UI:
- Always use high contrast (white on dark, or outlined)
- Add edge detection or outline shader for visibility

### Lighting

Avoid extremely dark or bright areas:
- **Minimum luminance**: 15% (prevent camping in shadows)
- **Maximum luminance**: 85% (prevent overexposure)
- Use fog to limit sightlines, not darkness

### Material Properties

For competitive fairness:
- No fully transparent materials (prevents invisibility)
- No extremely reflective materials (prevents blinding)
- Consistent material properties across weapon skins

## Quality Levels

Materials should adjust based on quality settings:

```javascript
function applyQualitySettings(material, quality) {
  switch (quality) {
    case 'low':
      material.envMapIntensity = 0;
      material.aoMapIntensity = 0;
      // Disable normal maps for performance
      break;
      
    case 'medium':
      material.envMapIntensity *= 0.5;
      material.aoMapIntensity = 0.5;
      break;
      
    case 'high':
      // Full quality
      break;
  }
}
```

## Material Caching

Reuse materials to reduce memory and draw calls:

```javascript
class MaterialLibrary {
  constructor() {
    this.materials = new Map();
  }
  
  getMaterial(name) {
    if (!this.materials.has(name)) {
      this.materials.set(name, this.createMaterial(name));
    }
    return this.materials.get(name);
  }
  
  dispose() {
    this.materials.forEach(mat => mat.dispose());
    this.materials.clear();
  }
}
```

## Shader Modifications

For advanced effects, clone and modify materials:

```javascript
const material = weaponMetal.clone();
material.onBeforeCompile = (shader) => {
  // Add custom shader code
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <output_fragment>',
    `
      // Custom fresnel effect
      float fresnel = pow(1.0 - dot(vNormal, vViewPosition), 3.0);
      outgoingLight += fresnel * vec3(0.2, 0.4, 1.0);
      #include <output_fragment>
    `
  );
};
```

## Examples

See `SceneManager.js` for material usage in map geometry.
See `FirstPersonRig.js` for weapon material setup.

## Performance Tips

1. **Share materials** between similar objects
2. **Use texture atlases** to reduce texture switches
3. **Limit transparent materials** (expensive to render)
4. **Combine similar materials** to reduce draw calls
5. **Use vertex colors** instead of textures where possible
