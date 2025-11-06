/**
 * SpatialGrid.js - Simple spatial partitioning grid for raycasting optimization
 * Divides 3D space into uniform cells for fast spatial queries
 */
import * as THREE from 'three';

export class SpatialGrid {
  constructor(bounds, cellSize) {
    this.bounds = bounds; // { min: Vector3, max: Vector3 }
    this.cellSize = cellSize;
    
    // Calculate grid dimensions
    const size = new THREE.Vector3().subVectors(bounds.max, bounds.min);
    this.gridSize = {
      x: Math.ceil(size.x / cellSize),
      y: Math.ceil(size.y / cellSize),
      z: Math.ceil(size.z / cellSize)
    };
    
    // Grid cells (3D array flattened)
    this.cells = new Map();
    
    // Object tracking
    this.objects = new Map(); // object -> cell keys
    
    console.log(`SpatialGrid created: ${this.gridSize.x}x${this.gridSize.y}x${this.gridSize.z} cells`);
  }
  
  /**
   * Get cell key from position
   */
  getCellKey(position) {
    const x = Math.floor((position.x - this.bounds.min.x) / this.cellSize);
    const y = Math.floor((position.y - this.bounds.min.y) / this.cellSize);
    const z = Math.floor((position.z - this.bounds.min.z) / this.cellSize);
    
    // Clamp to grid bounds
    const cx = Math.max(0, Math.min(this.gridSize.x - 1, x));
    const cy = Math.max(0, Math.min(this.gridSize.y - 1, y));
    const cz = Math.max(0, Math.min(this.gridSize.z - 1, z));
    
    return `${cx},${cy},${cz}`;
  }
  
  /**
   * Get multiple cell keys for a bounding box
   */
  getCellKeysForBounds(min, max) {
    const minKey = this.getCellKey(min);
    const maxKey = this.getCellKey(max);
    
    const [minX, minY, minZ] = minKey.split(',').map(Number);
    const [maxX, maxY, maxZ] = maxKey.split(',').map(Number);
    
    const keys = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          keys.push(`${x},${y},${z}`);
        }
      }
    }
    
    return keys;
  }
  
  /**
   * Insert object into grid
   */
  insert(object, position, radius = 0) {
    if (!object || !position) return;
    
    // Remove from old cells if already inserted
    this.remove(object);
    
    // Calculate bounds
    const min = new THREE.Vector3(
      position.x - radius,
      position.y - radius,
      position.z - radius
    );
    const max = new THREE.Vector3(
      position.x + radius,
      position.y + radius,
      position.z + radius
    );
    
    // Get cell keys
    const keys = this.getCellKeysForBounds(min, max);
    
    // Insert into cells
    keys.forEach(key => {
      if (!this.cells.has(key)) {
        this.cells.set(key, new Set());
      }
      this.cells.get(key).add(object);
    });
    
    // Track object
    this.objects.set(object, keys);
  }
  
  /**
   * Remove object from grid
   */
  remove(object) {
    if (!this.objects.has(object)) return;
    
    const keys = this.objects.get(object);
    
    keys.forEach(key => {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(object);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    });
    
    this.objects.delete(object);
  }
  
  /**
   * Update object position
   */
  update(object, position, radius = 0) {
    this.insert(object, position, radius);
  }
  
  /**
   * Query objects near a position
   */
  query(position, radius) {
    const min = new THREE.Vector3(
      position.x - radius,
      position.y - radius,
      position.z - radius
    );
    const max = new THREE.Vector3(
      position.x + radius,
      position.y + radius,
      position.z + radius
    );
    
    const keys = this.getCellKeysForBounds(min, max);
    const results = new Set();
    
    keys.forEach(key => {
      const cell = this.cells.get(key);
      if (cell) {
        cell.forEach(obj => results.add(obj));
      }
    });
    
    return Array.from(results);
  }
  
  /**
   * Query objects along a ray
   */
  queryRay(origin, direction, maxDistance) {
    const results = new Set();
    const step = this.cellSize * 0.5;
    const numSteps = Math.ceil(maxDistance / step);
    
    const point = new THREE.Vector3();
    
    for (let i = 0; i <= numSteps; i++) {
      const t = i * step;
      point.copy(origin).addScaledVector(direction, t);
      
      const key = this.getCellKey(point);
      const cell = this.cells.get(key);
      
      if (cell) {
        cell.forEach(obj => results.add(obj));
      }
    }
    
    return Array.from(results);
  }
  
  /**
   * Get all objects in grid
   */
  getAllObjects() {
    return Array.from(this.objects.keys());
  }
  
  /**
   * Clear the grid
   */
  clear() {
    this.cells.clear();
    this.objects.clear();
  }
  
  /**
   * Get statistics
   */
  getStats() {
    let totalObjects = 0;
    let nonEmptyCells = 0;
    let maxObjectsPerCell = 0;
    
    this.cells.forEach(cell => {
      nonEmptyCells++;
      totalObjects += cell.size;
      maxObjectsPerCell = Math.max(maxObjectsPerCell, cell.size);
    });
    
    const totalCells = this.gridSize.x * this.gridSize.y * this.gridSize.z;
    
    return {
      totalCells,
      nonEmptyCells,
      emptyPercentage: ((totalCells - nonEmptyCells) / totalCells * 100).toFixed(2) + '%',
      uniqueObjects: this.objects.size,
      totalObjects,
      maxObjectsPerCell,
      avgObjectsPerCell: (totalObjects / nonEmptyCells).toFixed(2)
    };
  }
  
  /**
   * Log grid statistics
   */
  logStats() {
    const stats = this.getStats();
    console.log('=== Spatial Grid Stats ===');
    console.log(`Grid Size: ${this.gridSize.x}x${this.gridSize.y}x${this.gridSize.z}`);
    console.log(`Total Cells: ${stats.totalCells}`);
    console.log(`Non-Empty Cells: ${stats.nonEmptyCells}`);
    console.log(`Empty: ${stats.emptyPercentage}`);
    console.log(`Unique Objects: ${stats.uniqueObjects}`);
    console.log(`Max Objects/Cell: ${stats.maxObjectsPerCell}`);
    console.log(`Avg Objects/Cell: ${stats.avgObjectsPerCell}`);
    console.log('=========================');
  }
}
