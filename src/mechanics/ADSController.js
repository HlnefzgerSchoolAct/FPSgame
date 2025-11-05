/**
 * ADSController - ADS transitions, movement penalty, sensitivity multiplier
 */
export class ADSController {
  constructor() {
    this.isADS = false;
    this.adsProgress = 0; // 0 to 1
    this.transitionSpeed = 4.0; // Speed of transition
    
    // Penalties
    this.movementSpeedMultiplier = 0.6; // 60% speed when ADS
    this.sensitivityMultiplier = 0.6; // 60% mouse sensitivity when ADS
    
    // FOV transition
    this.baseFOV = 90;
    this.adsFOV = 60;
    this.currentFOV = this.baseFOV;
  }
  
  /**
   * Update ADS state
   * @param {Boolean} wantsADS - Player wants to ADS
   * @param {Number} dt - Delta time
   * @param {Object} weaponStats - Current weapon stats (for ads_ms)
   */
  update(wantsADS, dt, weaponStats = null) {
    this.isADS = wantsADS;
    
    // Determine transition speed from weapon stats
    let transitionTime = 0.25; // default
    if (weaponStats && weaponStats.ads_ms) {
      transitionTime = weaponStats.ads_ms / 1000;
    }
    
    const speed = 1.0 / transitionTime;
    
    // Update progress
    if (this.isADS) {
      this.adsProgress = Math.min(1, this.adsProgress + speed * dt);
    } else {
      this.adsProgress = Math.max(0, this.adsProgress - speed * dt);
    }
    
    // Update FOV
    this.currentFOV = this.baseFOV + (this.adsFOV - this.baseFOV) * this.adsProgress;
  }
  
  /**
   * Get movement speed multiplier based on ADS state
   */
  getMovementMultiplier() {
    return 1.0 - (1.0 - this.movementSpeedMultiplier) * this.adsProgress;
  }
  
  /**
   * Get mouse sensitivity multiplier based on ADS state
   */
  getSensitivityMultiplier() {
    return 1.0 - (1.0 - this.sensitivityMultiplier) * this.adsProgress;
  }
  
  /**
   * Get current FOV
   */
  getFOV() {
    return this.currentFOV;
  }
  
  /**
   * Get ADS progress (0-1)
   */
  getProgress() {
    return this.adsProgress;
  }
  
  /**
   * Check if fully ADS
   */
  isFullyADS() {
    return this.adsProgress >= 0.99;
  }
  
  /**
   * Check if in ADS
   */
  inADS() {
    return this.isADS && this.adsProgress > 0;
  }
  
  /**
   * Reset ADS state
   */
  reset() {
    this.isADS = false;
    this.adsProgress = 0;
    this.currentFOV = this.baseFOV;
  }
  
  /**
   * Set FOV values
   */
  setFOV(baseFOV, adsFOV) {
    this.baseFOV = baseFOV;
    this.adsFOV = adsFOV;
  }
}
