/**
 * ObjectPool.js - Generic object pooling system
 * Reduces GC pressure by reusing objects instead of creating/destroying them
 */

export class ObjectPool {
  constructor(factory, reset, initialSize = 10, maxSize = 1000) {
    this.factory = factory;      // Function to create new objects
    this.reset = reset;          // Function to reset object state
    this.initialSize = initialSize;
    this.maxSize = maxSize;
    
    this.available = [];
    this.inUse = new Set();
    
    // Statistics
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      recycled: 0,
      maxInUse: 0,
      currentInUse: 0
    };
    
    // Pre-allocate initial pool
    this._preallocate();
  }
  
  /**
   * Pre-allocate initial pool size
   * @private
   */
  _preallocate() {
    for (let i = 0; i < this.initialSize; i++) {
      const obj = this.factory();
      this.available.push(obj);
      this.stats.created++;
    }
  }
  
  /**
   * Acquire an object from the pool
   * @returns {Object} Pooled object
   */
  acquire() {
    let obj;
    
    if (this.available.length > 0) {
      obj = this.available.pop();
      this.stats.recycled++;
    } else {
      // Create new object if pool is empty and not at max size
      if (this.stats.created < this.maxSize) {
        obj = this.factory();
        this.stats.created++;
      } else {
        console.warn(`ObjectPool: Max size (${this.maxSize}) reached. Reusing oldest object.`);
        // Force reuse of oldest in-use object
        const iterator = this.inUse.values();
        obj = iterator.next().value;
        this.inUse.delete(obj);
      }
    }
    
    this.inUse.add(obj);
    this.stats.acquired++;
    this.stats.currentInUse = this.inUse.size;
    this.stats.maxInUse = Math.max(this.stats.maxInUse, this.stats.currentInUse);
    
    return obj;
  }
  
  /**
   * Release an object back to the pool
   * @param {Object} obj - Object to release
   */
  release(obj) {
    if (!this.inUse.has(obj)) {
      console.warn('ObjectPool: Attempting to release object not in use');
      return;
    }
    
    this.inUse.delete(obj);
    
    // Reset object state
    if (this.reset) {
      this.reset(obj);
    }
    
    // Return to available pool if not over max size
    if (this.available.length + this.inUse.size < this.maxSize) {
      this.available.push(obj);
    }
    
    this.stats.released++;
    this.stats.currentInUse = this.inUse.size;
  }
  
  /**
   * Release all in-use objects
   */
  releaseAll() {
    const objects = Array.from(this.inUse);
    objects.forEach(obj => this.release(obj));
  }
  
  /**
   * Clear the pool
   */
  clear() {
    this.releaseAll();
    this.available = [];
    this.inUse.clear();
  }
  
  /**
   * Get pool statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      availableCount: this.available.length,
      totalAllocated: this.stats.created
    };
  }
  
  /**
   * Get current size
   * @returns {Object} Size information
   */
  getSize() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}
