#!/usr/bin/env node

/**
 * optimize-assets.js - Asset optimization script
 * 
 * This script provides utilities for optimizing game assets:
 * - Texture compression (KTX2/Basis)
 * - Mesh compression (Draco)
 * - Sprite atlas generation
 * 
 * Usage:
 *   node scripts/optimize-assets.js [command] [options]
 * 
 * Commands:
 *   textures  - Optimize textures to KTX2/Basis format
 *   meshes    - Compress meshes with Draco
 *   atlases   - Generate sprite atlases
 *   all       - Run all optimization steps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function optimizeTextures() {
  log('\n📦 Optimizing Textures...', 'blue');
  log('---------------------------', 'blue');
  
  const assetsPath = path.join(__dirname, '../assets/textures');
  
  if (!fs.existsSync(assetsPath)) {
    log('⚠️  No textures directory found', 'yellow');
    log(`Create directory: ${assetsPath}`, 'yellow');
    return;
  }
  
  log('ℹ️  Texture compression requires external tools:', 'yellow');
  log('   - basisu (Basis Universal): https://github.com/BinomialLLC/basis_universal', 'yellow');
  log('   - toktx (KTX-Software): https://github.com/KhronosGroup/KTX-Software', 'yellow');
  log('');
  log('Example commands:', 'blue');
  log('  basisu -comp_level 4 -q 128 input.png -output_file output.basis', 'reset');
  log('  toktx --encode uastc --uastc_quality 3 output.ktx2 input.png', 'reset');
  log('');
  log('For batch processing:', 'blue');
  log('  find assets/textures -name "*.png" -exec basisu -comp_level 4 -q 128 {} \\;', 'reset');
  
  // Check for texture files
  const files = fs.readdirSync(assetsPath).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );
  
  if (files.length > 0) {
    log(`\nFound ${files.length} texture files to optimize:`, 'green');
    files.forEach(f => log(`  - ${f}`, 'reset'));
  } else {
    log('\nNo texture files found', 'yellow');
  }
}

function optimizeMeshes() {
  log('\n🔷 Optimizing Meshes...', 'blue');
  log('------------------------', 'blue');
  
  const assetsPath = path.join(__dirname, '../assets/models');
  
  if (!fs.existsSync(assetsPath)) {
    log('⚠️  No models directory found', 'yellow');
    log(`Create directory: ${assetsPath}`, 'yellow');
    return;
  }
  
  log('ℹ️  Mesh compression requires gltf-pipeline:', 'yellow');
  log('   npm install -g gltf-pipeline', 'yellow');
  log('');
  log('Example commands:', 'blue');
  log('  gltf-pipeline -i model.glb -o model-draco.glb -d', 'reset');
  log('');
  log('For batch processing:', 'blue');
  log('  find assets/models -name "*.glb" -exec gltf-pipeline -i {} -o {}-draco.glb -d \\;', 'reset');
  
  // Check for model files
  const files = fs.readdirSync(assetsPath).filter(f => 
    f.endsWith('.glb') || f.endsWith('.gltf')
  );
  
  if (files.length > 0) {
    log(`\nFound ${files.length} model files to optimize:`, 'green');
    files.forEach(f => log(`  - ${f}`, 'reset'));
  } else {
    log('\nNo model files found', 'yellow');
  }
}

function generateAtlases() {
  log('\n🎨 Generating Sprite Atlases...', 'blue');
  log('--------------------------------', 'blue');
  
  const spritesPath = path.join(__dirname, '../assets/sprites');
  
  if (!fs.existsSync(spritesPath)) {
    log('⚠️  No sprites directory found', 'yellow');
    log(`Create directory: ${spritesPath}`, 'yellow');
    return;
  }
  
  log('ℹ️  Sprite atlas generation requires TexturePacker or similar tool:', 'yellow');
  log('   - TexturePacker: https://www.codeandweb.com/texturepacker', 'yellow');
  log('   - Free alternative: https://www.npmjs.com/package/spritesheet-js', 'yellow');
  log('');
  log('Example command with spritesheet-js:', 'blue');
  log('  npx spritesheet-js assets/sprites/*.png -f json -n ui-atlas', 'reset');
  log('');
  log('Recommended atlas structure:', 'blue');
  log('  - ui-atlas.png (UI elements, buttons, icons)', 'reset');
  log('  - decal-atlas.png (Bullet holes, impact marks)', 'reset');
  log('  - particle-atlas.png (Particle textures)', 'reset');
  
  // Check for sprite files
  const files = fs.readdirSync(spritesPath).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg')
  );
  
  if (files.length > 0) {
    log(`\nFound ${files.length} sprite files:`, 'green');
    files.forEach(f => log(`  - ${f}`, 'reset'));
  } else {
    log('\nNo sprite files found', 'yellow');
  }
}

function showHelp() {
  log('\n📚 Asset Optimization Tool', 'blue');
  log('============================', 'blue');
  log('');
  log('Usage:', 'green');
  log('  npm run optimize:assets [command]', 'reset');
  log('  node scripts/optimize-assets.js [command]', 'reset');
  log('');
  log('Commands:', 'green');
  log('  textures  - Optimize textures to KTX2/Basis format', 'reset');
  log('  meshes    - Compress meshes with Draco', 'reset');
  log('  atlases   - Generate sprite atlases', 'reset');
  log('  all       - Run all optimization steps', 'reset');
  log('  help      - Show this help message', 'reset');
  log('');
  log('Examples:', 'green');
  log('  npm run optimize:assets textures', 'reset');
  log('  npm run optimize:assets all', 'reset');
  log('');
  log('Performance Targets:', 'yellow');
  log('  - Textures: KTX2/Basis with UASTC or ETC1S compression', 'reset');
  log('  - Meshes: Draco compression for static geometry', 'reset');
  log('  - Atlases: Max 2048x2048 for UI, decals, particles', 'reset');
  log('');
  log('See docs/performance_profiling.md for more details', 'blue');
}

function createDirectories() {
  const dirs = [
    'assets/textures',
    'assets/models',
    'assets/sprites',
    'assets/audio',
    'assets/maps'
  ];
  
  log('\n📁 Creating asset directories...', 'blue');
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`✓ Created ${dir}`, 'green');
    } else {
      log(`✓ ${dir} exists`, 'green');
    }
  });
}

// Main execution
const command = process.argv[2] || 'help';

switch (command) {
  case 'textures':
    optimizeTextures();
    break;
  case 'meshes':
    optimizeMeshes();
    break;
  case 'atlases':
    generateAtlases();
    break;
  case 'all':
    optimizeTextures();
    optimizeMeshes();
    generateAtlases();
    break;
  case 'init':
    createDirectories();
    break;
  case 'help':
  default:
    showHelp();
    break;
}

log('');
