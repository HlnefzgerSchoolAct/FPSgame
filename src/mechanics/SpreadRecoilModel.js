/**
 * SpreadRecoilModel - Coherent spread/recoil model based on weapon role, movement, and ADS
 */
export class SpreadRecoilModel {
  constructor(weaponStats) {
    this.spreadMin = weaponStats.spread_min || 0.1;
    this.spreadMax = weaponStats.spread_max || 3.0;
    this.spreadADSMult = weaponStats.spread_ads_mult || 0.4;
    this.spreadIncrement = 0.15;
    this.spreadDecayRate = 2.5; // units per second
    
    this.currentSpread = this.spreadMin;
    this.recoilMultiplier = 1.0;
  }
  
  update(dt) {
    // Decay spread over time
    if (this.currentSpread > this.spreadMin) {
      this.currentSpread -= this.spreadDecayRate * dt;
      this.currentSpread = Math.max(this.spreadMin, this.currentSpread);
    }
  }
  
  addSpread() {
    this.currentSpread += this.spreadIncrement;
    this.currentSpread = Math.min(this.spreadMax, this.currentSpread);
  }
  
  getSpread(isADS, movementState) {
    let spread = this.currentSpread;
    
    // Apply ADS multiplier
    if (isADS) {
      spread *= this.spreadADSMult;
    }
    
    // Apply movement penalties
    if (movementState) {
      if (movementState.isSliding) {
        spread *= 2.5;
      } else if (movementState.isSprinting) {
        spread *= 2.0;
      } else if (movementState.isCrouching) {
        spread *= 0.7;
      } else if (!movementState.isGrounded) {
        spread *= 3.0;
      }
    }
    
    return spread;
  }
  
  getRecoilMultiplier(isADS, movementState) {
    let mult = this.recoilMultiplier;
    
    // ADS reduces recoil
    if (isADS) {
      mult *= 0.7;
    }
    
    // Movement affects recoil
    if (movementState) {
      if (movementState.isSliding) {
        mult *= 2.0;
      } else if (movementState.isSprinting) {
        mult *= 1.5;
      } else if (movementState.isCrouching) {
        mult *= 0.8;
      } else if (!movementState.isGrounded) {
        mult *= 2.5;
      }
    }
    
    return mult;
  }
  
  reset() {
    this.currentSpread = this.spreadMin;
  }
  
  getCurrentSpread() {
    return this.currentSpread;
  }
}
