/**
 * LODManager.js - Level of Detail management system
 * Manages LOD switching for meshes based on distance from camera
 */
import * as THREE from 'three';

export class LODManager {
  constructor() {
    this.lodObjects = new Map(); // object -> LOD config
    this.cameraPosition = new THREE.Vector3();
    
    // LOD distance thresholds (in world units)
    this.lodDistances = {
      high: 20,    // 0-20 units: High detail
      medium: 50,  // 20-50 units: Medium detail
      low: 100     // 50-100 units: Low detail
      // Beyond 100: Culled or lowest detail
    };
    
    console.log('LODManager initialized');
  }
  
  /**
   * Register an object with LOD levels
   * @param {THREE.Object3D} object - The object to manage
   * @param {Array} levels - Array of LOD levels: [{distance: number, mesh: THREE.Mesh}]
   */
  registerObject(object, levels) {
    if (!object || !levels || levels.length === 0) {
      console.warn('LODManager: Invalid object or levels');
      return;
    }
    
    // Sort levels by distance (ascending)
    levels.sort((a, b) => a.distance - b.distance);
    
    // Store LOD configuration
    this.lodObjects.set(object, {
      levels,
      currentLevel: 0,
      position: new THREE.Vector3()
    });
    
    // Show highest detail by default
    this._switchLevel(object, 0);
  }
  
  /**
   * Unregister an object from LOD management
   */
  unregisterObject(object) {
    this.lodObjects.delete(object);
  }
  
  /**
   * Update LOD levels based on camera position
   */
  update(cameraPosition) {
    this.cameraPosition.copy(cameraPosition);
    
    this.lodObjects.forEach((config, object) => {
      // Update object position
      object.getWorldPosition(config.position);
      
      // Calculate distance to camera
      const distance = this.cameraPosition.distanceTo(config.position);
      
      // Determine appropriate LOD level
      let newLevel = config.levels.length - 1; // Default to lowest detail
      
      for (let i = 0; i < config.levels.length; i++) {
        if (distance < config.levels[i].distance) {
          newLevel = i;
          break;
        }
      }
      
      // Switch level if changed
      if (newLevel !== config.currentLevel) {
        this._switchLevel(object, newLevel);
        config.currentLevel = newLevel;
      }
    });
  }
  
  /**
   * Switch to a specific LOD level
   * @private
   */
  _switchLevel(object, level) {
    const config = this.lodObjects.get(object);
    if (!config) return;
    
    // Hide all levels
    config.levels.forEach(lodLevel => {
      if (lodLevel.mesh) {
        lodLevel.mesh.visible = false;
      }
    });
    
    // Show selected level
    if (config.levels[level] && config.levels[level].mesh) {
      config.levels[level].mesh.visible = true;
    }
  }
  
  /**
   * Create LOD levels from a high-detail mesh
   * Helper function to generate simplified versions
   */
  createLODLevels(highDetailMesh, distances = null) {
    const levels = [];
    const dist = distances || [this.lodDistances.high, this.lodDistances.medium, this.lodDistances.low];
    
    // Level 0: High detail (original)
    levels.push({
      distance: dist[0],
      mesh: highDetailMesh.clone()
    });
    
    // Level 1: Medium detail (simplified)
    const mediumMesh = highDetailMesh.clone();
    this._simplifyMesh(mediumMesh, 0.5); // 50% of original detail
    levels.push({
      distance: dist[1],
      mesh: mediumMesh
    });
    
    // Level 2: Low detail (highly simplified)
    const lowMesh = highDetailMesh.clone();
    this._simplifyMesh(lowMesh, 0.25); // 25% of original detail
    levels.push({
      distance: dist[2],
      mesh: lowMesh
    });
    
    return levels;
  }
  
  /**
   * Simplify a mesh by reducing geometry detail
   * @private
   */
  _simplifyMesh(mesh, factor) {
    // Simple simplification: reduce geometry resolution
    // In a real implementation, you'd use a proper mesh simplification algorithm
    
    if (mesh.geometry && mesh.geometry.isBufferGeometry) {
      const geometry = mesh.geometry;
      
      // For demonstration, we'll just scale down the mesh slightly
      // A real implementation would use algorithms like:
      // - Edge collapse
      // - Vertex clustering
      // - Quadric error metrics
      
      mesh.scale.multiplyScalar(0.95); // Slight scale reduction
      
      // Optionally remove some vertices (simplified approach)
      // This is a placeholder for actual mesh simplification
    }
  }
  
  /**
   * Create a THREE.LOD object (alternative approach)
   */
  createThreeLOD(meshes, distances = null) {
    const lod = new THREE.LOD();
    const dist = distances || [this.lodDistances.high, this.lodDistances.medium, this.lodDistances.low];
    
    meshes.forEach((mesh, index) => {
      lod.addLevel(mesh, index < dist.length ? dist[index] : dist[dist.length - 1]);
    });
    
    return lod;
  }
  
  /**
   * Set LOD distance thresholds
   */
  setDistances(high, medium, low) {
    this.lodDistances.high = high;
    this.lodDistances.medium = medium;
    this.lodDistances.low = low;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalObjects: this.lodObjects.size,
      levels: { high: 0, medium: 0, low: 0 }
    };
    
    this.lodObjects.forEach((config) => {
      const level = config.currentLevel;
      if (level === 0) stats.levels.high++;
      else if (level === 1) stats.levels.medium++;
      else stats.levels.low++;
    });
    
    return stats;
  }
  
  /**
   * Clear all LOD objects
   */
  clear() {
    this.lodObjects.clear();
  }
  
  /**
   * Dispose of all LOD resources
   */
  dispose() {
    this.lodObjects.forEach((config) => {
      config.levels.forEach(level => {
        if (level.mesh) {
          if (level.mesh.geometry) level.mesh.geometry.dispose();
          if (level.mesh.material) {
            if (Array.isArray(level.mesh.material)) {
              level.mesh.material.forEach(mat => mat.dispose());
            } else {
              level.mesh.material.dispose();
            }
          }
        }
      });
    });
    
    this.clear();
  }
}
