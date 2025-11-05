/**
 * RecoilPattern - Pattern-based recoil with skill-based compensation
 */
export class RecoilPattern {
  constructor(patternData) {
    this.shots = patternData.shots || [];
    this.recoveryPerMs = patternData.recovery_per_ms || 0.015;
    this.maxRecoveryPerFrame = patternData.max_recovery_per_frame || 0.3;
    
    this.currentShot = 0;
    this.timeSinceLastShot = 0;
    this.accumulatedRecoil = { x: 0, y: 0 };
  }
  
  getNextRecoil(playerCompensation = { x: 0, y: 0 }) {
    if (this.currentShot >= this.shots.length) {
      // Use last pattern shot if we exceed pattern length
      this.currentShot = this.shots.length - 1;
    }
    
    const shot = this.shots[this.currentShot];
    this.currentShot++;
    this.timeSinceLastShot = 0;
    
    // Apply player compensation (skill-based)
    const actualRecoil = {
      x: shot.x - playerCompensation.x,
      y: shot.y - playerCompensation.y
    };
    
    this.accumulatedRecoil.x += actualRecoil.x;
    this.accumulatedRecoil.y += actualRecoil.y;
    
    return actualRecoil;
  }
  
  update(dt) {
    this.timeSinceLastShot += dt;
    
    // Recover recoil over time
    const recoveryAmount = Math.min(
      this.recoveryPerMs * dt * 1000,
      this.maxRecoveryPerFrame
    );
    
    if (this.accumulatedRecoil.x !== 0) {
      const sign = Math.sign(this.accumulatedRecoil.x);
      this.accumulatedRecoil.x -= sign * Math.min(Math.abs(this.accumulatedRecoil.x), recoveryAmount);
    }
    
    if (this.accumulatedRecoil.y !== 0) {
      const sign = Math.sign(this.accumulatedRecoil.y);
      this.accumulatedRecoil.y -= sign * Math.min(Math.abs(this.accumulatedRecoil.y), recoveryAmount);
    }
    
    // Reset shot counter if enough time has passed
    if (this.timeSinceLastShot > 0.5) {
      this.currentShot = 0;
    }
  }
  
  reset() {
    this.currentShot = 0;
    this.timeSinceLastShot = 0;
    this.accumulatedRecoil = { x: 0, y: 0 };
  }
  
  getCurrentShot() {
    return this.currentShot;
  }
  
  getAccumulatedRecoil() {
    return { ...this.accumulatedRecoil };
  }
}
