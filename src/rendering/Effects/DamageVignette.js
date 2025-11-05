/**
 * DamageVignette.js - Screen-space damage vignette effect
 * Displays red vignette when taking damage
 */
import * as THREE from 'three';

export class DamageVignette {
  constructor() {
    this.vignetteIntensity = 0;
    this.targetIntensity = 0;
    this.fadeSpeed = 2.0;
    console.log('DamageVignette effect created');
  }
  
  /**
   * Trigger damage vignette
   */
  showDamage(amount) {
    // Intensity based on damage amount (0-100)
    this.targetIntensity = Math.min(amount / 100, 0.8);
  }
  
  /**
   * Update vignette fade
   */
  update(deltaTime) {
    // Fade to target
    if (this.vignetteIntensity < this.targetIntensity) {
      this.vignetteIntensity = this.targetIntensity;
    } else {
      this.vignetteIntensity -= this.fadeSpeed * deltaTime;
      this.vignetteIntensity = Math.max(0, this.vignetteIntensity);
    }
    
    // Reset target to fade out
    this.targetIntensity = 0;
  }
  
  /**
   * Get current intensity for shader
   */
  getIntensity() {
    return this.vignetteIntensity;
  }
  
  dispose() {
    this.vignetteIntensity = 0;
  }
}
