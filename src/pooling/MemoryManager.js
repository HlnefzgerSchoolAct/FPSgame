/**
 * MemoryManager.js - Memory management utilities for Three.js resources
 * Ensures proper disposal of geometries, materials, and textures
 */

export class MemoryManager {
  constructor() {
    this.trackedResources = new Map();
    this.disposalCallbacks = [];
    this.stats = {
      geometriesDisposed: 0,
      materialsDisposed: 0,
      texturesDisposed: 0,
      lastCleanup: 0
    };
    
    console.log('MemoryManager initialized');
  }
  
  /**
   * Track a resource for automatic disposal
   */
  track(resource, type, id = null) {
    const key = id || this._generateId();
    this.trackedResources.set(key, { resource, type });
    return key;
  }
  
  /**
   * Untrack a resource
   */
  untrack(id) {
    return this.trackedResources.delete(id);
  }
  
  /**
   * Generate unique ID for resources
   * @private
   */
  _generateId() {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Dispose a single mesh and its resources
   */
  disposeMesh(mesh) {
    if (!mesh) return;
    
    // Dispose geometry
    if (mesh.geometry) {
      mesh.geometry.dispose();
      this.stats.geometriesDisposed++;
    }
    
    // Dispose material(s)
    if (mesh.material) {
      this.disposeMaterial(mesh.material);
    }
    
    // Remove from parent
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
  }
  
  /**
   * Dispose material and its textures
   */
  disposeMaterial(material) {
    if (!material) return;
    
    // Handle array of materials
    if (Array.isArray(material)) {
      material.forEach(mat => this.disposeMaterial(mat));
      return;
    }
    
    // Dispose all texture maps
    const textureProps = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap',
      'aoMap', 'emissiveMap', 'bumpMap', 'displacementMap',
      'alphaMap', 'lightMap', 'envMap'
    ];
    
    textureProps.forEach(prop => {
      if (material[prop]) {
        this.disposeTexture(material[prop]);
      }
    });
    
    // Dispose material
    material.dispose();
    this.stats.materialsDisposed++;
  }
  
  /**
   * Dispose texture
   */
  disposeTexture(texture) {
    if (!texture) return;
    
    texture.dispose();
    this.stats.texturesDisposed++;
  }
  
  /**
   * Dispose geometry
   */
  disposeGeometry(geometry) {
    if (!geometry) return;
    
    geometry.dispose();
    this.stats.geometriesDisposed++;
  }
  
  /**
   * Dispose an entire scene and its contents
   */
  disposeScene(scene) {
    if (!scene) return;
    
    scene.traverse((object) => {
      if (object.isMesh || object.isLine || object.isPoints) {
        this.disposeMesh(object);
      }
    });
    
    // Clear the scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }
  
  /**
   * Dispose render target
   */
  disposeRenderTarget(renderTarget) {
    if (!renderTarget) return;
    
    if (renderTarget.texture) {
      this.disposeTexture(renderTarget.texture);
    }
    
    renderTarget.dispose();
  }
  
  /**
   * Perform periodic cleanup of tracked resources
   */
  cleanup(force = false) {
    const now = Date.now();
    
    // Don't cleanup too frequently unless forced
    if (!force && now - this.stats.lastCleanup < 30000) {
      return;
    }
    
    // Run registered cleanup callbacks
    this.disposalCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback error:', error);
      }
    });
    
    this.stats.lastCleanup = now;
    
    if (force) {
      console.log('Memory cleanup completed (forced)');
    }
  }
  
  /**
   * Register a cleanup callback
   */
  onCleanup(callback) {
    this.disposalCallbacks.push(callback);
  }
  
  /**
   * Remove a cleanup callback
   */
  offCleanup(callback) {
    const index = this.disposalCallbacks.indexOf(callback);
    if (index > -1) {
      this.disposalCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Estimate GPU memory usage for a texture
   */
  estimateTextureMemory(texture) {
    if (!texture || !texture.image) return 0;
    
    const { width, height } = texture.image;
    
    // Calculate base size (RGBA8 = 4 bytes per pixel)
    let size = width * height * 4;
    
    // Account for mipmaps (approximately 1.33x base size)
    if (texture.generateMipmaps) {
      size *= 1.33;
    }
    
    return size;
  }
  
  /**
   * Estimate GPU memory usage for geometry
   */
  estimateGeometryMemory(geometry) {
    if (!geometry) return 0;
    
    let size = 0;
    const attributes = geometry.attributes;
    
    for (let key in attributes) {
      size += attributes[key].array.byteLength;
    }
    
    // Account for index buffer
    if (geometry.index) {
      size += geometry.index.array.byteLength;
    }
    
    return size;
  }
  
  /**
   * Calculate total GPU memory usage for a scene
   */
  calculateSceneMemory(scene) {
    let textureMemory = 0;
    let geometryMemory = 0;
    const processedTextures = new Set();
    const processedGeometries = new Set();
    
    scene.traverse((object) => {
      // Count geometry
      if (object.geometry && !processedGeometries.has(object.geometry.uuid)) {
        geometryMemory += this.estimateGeometryMemory(object.geometry);
        processedGeometries.add(object.geometry.uuid);
      }
      
      // Count materials and textures
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        
        materials.forEach(material => {
          const textureProps = [
            'map', 'normalMap', 'roughnessMap', 'metalnessMap',
            'aoMap', 'emissiveMap', 'bumpMap', 'displacementMap'
          ];
          
          textureProps.forEach(prop => {
            const texture = material[prop];
            if (texture && !processedTextures.has(texture.uuid)) {
              textureMemory += this.estimateTextureMemory(texture);
              processedTextures.add(texture.uuid);
            }
          });
        });
      }
    });
    
    return {
      textures: textureMemory,
      geometries: geometryMemory,
      total: textureMemory + geometryMemory
    };
  }
  
  /**
   * Get memory statistics
   */
  getStats() {
    return {
      ...this.stats,
      trackedResources: this.trackedResources.size
    };
  }
  
  /**
   * Log memory statistics
   */
  logStats() {
    const stats = this.getStats();
    console.log('=== Memory Manager Stats ===');
    console.log(`Geometries Disposed: ${stats.geometriesDisposed}`);
    console.log(`Materials Disposed: ${stats.materialsDisposed}`);
    console.log(`Textures Disposed: ${stats.texturesDisposed}`);
    console.log(`Tracked Resources: ${stats.trackedResources}`);
    console.log('============================');
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      geometriesDisposed: 0,
      materialsDisposed: 0,
      texturesDisposed: 0,
      lastCleanup: 0
    };
  }
  
  /**
   * Dispose all tracked resources
   */
  disposeAll() {
    this.trackedResources.forEach(({ resource, type }) => {
      switch (type) {
        case 'mesh':
          this.disposeMesh(resource);
          break;
        case 'material':
          this.disposeMaterial(resource);
          break;
        case 'texture':
          this.disposeTexture(resource);
          break;
        case 'geometry':
          this.disposeGeometry(resource);
          break;
        case 'scene':
          this.disposeScene(resource);
          break;
        default:
          if (resource.dispose) {
            resource.dispose();
          }
      }
    });
    
    this.trackedResources.clear();
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
