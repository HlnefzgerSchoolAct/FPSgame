/**
 * DynamicResolution.js - Dynamic resolution scaling system
 * Adjusts rendering resolution based on performance to maintain target FPS
 */

export class DynamicResolution {
  constructor(renderer, targetFPS = 60) {
    this.renderer = renderer;
    this.targetFPS = targetFPS;
    this.targetFrameTime = 1000 / targetFPS; // ms
    
    // Resolution settings
    this.enabled = false;
    this.minScale = 0.5;
    this.maxScale = 1.0;
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    
    // Adjustment parameters
    this.adjustmentSpeed = 0.1; // How fast to adjust (0-1)
    this.measureWindow = 60; // Number of frames to average
    this.frameTimeSamples = [];
    
    // Thresholds
    this.scaleDownThreshold = 1.15; // Scale down if > 115% target frame time
    this.scaleUpThreshold = 0.85;   // Scale up if < 85% target frame time
    
    // Update interval
    this.updateInterval = 500; // ms between adjustments
    this.lastUpdateTime = 0;
    
    console.log('DynamicResolution initialized');
  }
  
  /**
   * Enable dynamic resolution scaling
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    this._applyScale(this.currentScale);
    
    console.log('Dynamic resolution enabled');
  }
  
  /**
   * Disable dynamic resolution scaling
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    this._applyScale(1.0);
    
    console.log('Dynamic resolution disabled');
  }
  
  /**
   * Toggle dynamic resolution
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }
  
  /**
   * Update dynamic resolution based on frame time
   */
  update(frameTime) {
    if (!this.enabled) return;
    
    // Add frame time sample
    this.frameTimeSamples.push(frameTime);
    if (this.frameTimeSamples.length > this.measureWindow) {
      this.frameTimeSamples.shift();
    }
    
    // Check if enough time has passed since last adjustment
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }
    
    // Calculate average frame time
    if (this.frameTimeSamples.length < this.measureWindow) {
      return; // Not enough samples yet
    }
    
    const avgFrameTime = this.frameTimeSamples.reduce((a, b) => a + b, 0) / this.frameTimeSamples.length;
    const frameTimeRatio = avgFrameTime / this.targetFrameTime;
    
    // Determine if we need to adjust resolution
    if (frameTimeRatio > this.scaleDownThreshold) {
      // Performance is bad, reduce resolution
      const adjustment = Math.min(0.1, (frameTimeRatio - this.scaleDownThreshold) * 0.2);
      this.targetScale = Math.max(this.minScale, this.currentScale - adjustment);
    } else if (frameTimeRatio < this.scaleUpThreshold) {
      // Performance is good, increase resolution
      const adjustment = Math.min(0.1, (this.scaleUpThreshold - frameTimeRatio) * 0.2);
      this.targetScale = Math.min(this.maxScale, this.currentScale + adjustment);
    }
    
    // Smoothly interpolate to target scale
    this.currentScale += (this.targetScale - this.currentScale) * this.adjustmentSpeed;
    
    // Apply scale if it changed significantly
    if (Math.abs(this.currentScale - this.targetScale) < 0.01) {
      this.currentScale = this.targetScale;
    }
    
    this._applyScale(this.currentScale);
    
    this.lastUpdateTime = now;
  }
  
  /**
   * Apply resolution scale to renderer
   * @private
   */
  _applyScale(scale) {
    if (!this.renderer) return;
    
    this.renderer.setPixelRatio(window.devicePixelRatio * scale);
  }
  
  /**
   * Set resolution scale manually
   */
  setScale(scale) {
    this.targetScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    this.currentScale = this.targetScale;
    
    if (this.enabled) {
      this._applyScale(this.currentScale);
    }
  }
  
  /**
   * Set scale range
   */
  setRange(min, max) {
    this.minScale = Math.max(0.25, Math.min(1.0, min));
    this.maxScale = Math.max(this.minScale, Math.min(1.0, max));
    
    // Clamp current scale to new range
    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale));
    this.targetScale = Math.max(this.minScale, Math.min(this.maxScale, this.targetScale));
  }
  
  /**
   * Get current resolution scale
   */
  getScale() {
    return this.currentScale;
  }
  
  /**
   * Get resolution statistics
   */
  getStats() {
    const size = this.renderer.getSize(new THREE.Vector2());
    const actualSize = {
      width: Math.floor(size.width * this.currentScale),
      height: Math.floor(size.height * this.currentScale)
    };
    
    return {
      enabled: this.enabled,
      currentScale: this.currentScale.toFixed(3),
      targetScale: this.targetScale.toFixed(3),
      resolution: `${actualSize.width}x${actualSize.height}`,
      percentage: (this.currentScale * 100).toFixed(1) + '%'
    };
  }
  
  /**
   * Reset to default state
   */
  reset() {
    this.currentScale = 1.0;
    this.targetScale = 1.0;
    this.frameTimeSamples = [];
    this.lastUpdateTime = 0;
    
    if (this.enabled) {
      this._applyScale(1.0);
    }
  }
}
