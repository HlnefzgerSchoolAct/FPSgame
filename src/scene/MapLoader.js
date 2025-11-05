/**
 * MapLoader.js - Map loading and asset management
 * Handles spawn points, objective markers, and GPU instancing for props
 */
import * as THREE from 'three';

export class MapLoader {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.loadedAssets = new Map();
    console.log('MapLoader created');
  }
  
  /**
   * Load a map by ID
   */
  async loadMap(mapId) {
    console.log(`MapLoader: Loading map ${mapId}`);
    
    // Delegate to SceneManager
    const success = await this.sceneManager.loadMap(mapId);
    
    if (success) {
      console.log(`MapLoader: Map ${mapId} loaded successfully`);
    }
    
    return success;
  }
  
  /**
   * Get spawn points for a team
   */
  getSpawnPoints(team) {
    return this.sceneManager.getSpawnPoints(team);
  }
  
  /**
   * Get objective locations
   */
  getObjectiveLocations(mode) {
    return this.sceneManager.getObjectiveLocations(mode);
  }
  
  /**
   * Preload assets for a map
   */
  async preloadAssets(mapId) {
    // Placeholder for asset preloading
    // In production, this would load textures, models, etc.
    console.log(`Preloading assets for map: ${mapId}`);
    return true;
  }
  
  /**
   * Dispose of loaded assets
   */
  dispose() {
    this.loadedAssets.forEach((asset, key) => {
      if (asset.geometry) asset.geometry.dispose();
      if (asset.material) asset.material.dispose();
      if (asset.texture) asset.texture.dispose();
    });
    
    this.loadedAssets.clear();
    console.log('MapLoader disposed');
  }
}
