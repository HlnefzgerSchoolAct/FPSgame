/**
 * WeaponSystem - Fire modes, RPM lock, mag/reload, recoil, spread, ADS, sway, switch times
 */
import { RecoilPattern } from './RecoilPattern.js';
import { SpreadRecoilModel } from '../mechanics/SpreadRecoilModel.js';

export class WeaponSystem {
  constructor(weaponData, recoilPatternData) {
    this.weaponData = weaponData;
    this.stats = weaponData.stats;
    
    // Ammo state
    this.currentAmmo = this.stats.mag_size;
    this.reserveAmmo = this.stats.mag_size * 5; // Starting reserve
    this.maxReserve = this.stats.mag_size * 8;
    
    // Fire state
    this.fireMode = this.stats.fire_mode[0]; // Default to first mode
    this.canFire = true;
    this.timeSinceLastShot = 0;
    this.fireInterval = 60000 / this.stats.rpm; // ms between shots
    this.isFiring = false;
    this.burstShotsFired = 0;
    
    // Reload state
    this.isReloading = false;
    this.reloadTime = 0;
    
    // ADS state
    this.isADS = false;
    this.adsTransitionTime = 0;
    this.adsProgress = 0; // 0 to 1
    
    // Weapon switch
    this.isEquipped = true;
    this.equipTime = 0;
    
    // Recoil and spread
    this.recoilPattern = recoilPatternData ? 
      new RecoilPattern(recoilPatternData) : null;
    this.spreadModel = new SpreadRecoilModel(this.stats);
    
    // Weapon sway
    this.swayAmount = this.stats.sway || 1.0;
    this.swayTime = 0;
  }
  
  update(dt) {
    this.timeSinceLastShot += dt;
    
    // Update recoil pattern
    if (this.recoilPattern) {
      this.recoilPattern.update(dt);
    }
    
    // Update spread model
    this.spreadModel.update(dt);
    
    // Check if can fire again
    if (!this.canFire && this.timeSinceLastShot >= this.fireInterval / 1000) {
      this.canFire = true;
    }
    
    // Update reload
    if (this.isReloading) {
      this.reloadTime += dt;
      if (this.reloadTime >= this.stats.reload_ms / 1000) {
        this._finishReload();
      }
    }
    
    // Update ADS transition
    if (this.isADS && this.adsProgress < 1) {
      this.adsTransitionTime += dt;
      this.adsProgress = Math.min(1, this.adsTransitionTime / (this.stats.ads_ms / 1000));
    } else if (!this.isADS && this.adsProgress > 0) {
      this.adsTransitionTime -= dt;
      this.adsProgress = Math.max(0, this.adsTransitionTime / (this.stats.ads_ms / 1000));
    }
    
    // Update weapon sway
    this.swayTime += dt;
    
    // Update equip time
    if (!this.isEquipped) {
      this.equipTime += dt;
      if (this.equipTime >= this.stats.equip_ms / 1000) {
        this.isEquipped = true;
      }
    }
  }
  
  fire(playerState = null) {
    // Check if can fire
    if (!this.canFire || this.isReloading || !this.isEquipped) {
      return null;
    }
    
    if (this.currentAmmo <= 0) {
      this._emitEvent('weapon:dryfire', { weapon: this.weaponData.id });
      return null;
    }
    
    // Check fire mode
    if (this.fireMode === 'burst') {
      if (this.burstShotsFired >= this.stats.burst_count) {
        return null;
      }
    }
    
    // Consume ammo
    this.currentAmmo--;
    this.canFire = false;
    this.timeSinceLastShot = 0;
    
    // Burst tracking
    if (this.fireMode === 'burst') {
      this.burstShotsFired++;
      if (this.burstShotsFired >= this.stats.burst_count) {
        setTimeout(() => {
          this.burstShotsFired = 0;
        }, this.stats.burst_delay_ms);
      }
    }
    
    // Get recoil
    const recoilMult = this.spreadModel.getRecoilMultiplier(
      this.isADS, 
      playerState
    );
    
    const recoil = this.recoilPattern ? 
      this.recoilPattern.getNextRecoil() : 
      { x: 0, y: 1.0 };
    
    // Add spread
    this.spreadModel.addSpread();
    
    // Calculate final spread
    const spread = this.spreadModel.getSpread(this.isADS, playerState);
    
    // Emit fire event
    this._emitEvent('input:shoot', {
      weapon: this.weaponData.id,
      ammo: this.currentAmmo,
      reserve: this.reserveAmmo,
      spread,
      recoil: {
        x: recoil.x * recoilMult,
        y: recoil.y * recoilMult
      }
    });
    
    return {
      damage: this.stats.dmg_body,
      headshotDamage: this.stats.dmg_head,
      spread,
      recoil: {
        x: recoil.x * recoilMult,
        y: recoil.y * recoilMult
      },
      penetration: this.stats.penetration_level
    };
  }
  
  reload() {
    if (this.isReloading || this.currentAmmo === this.stats.mag_size) {
      return false;
    }
    
    if (this.reserveAmmo <= 0) {
      return false;
    }
    
    this.isReloading = true;
    this.reloadTime = 0;
    this.canFire = false;
    
    this._emitEvent('input:reload', {
      weapon: this.weaponData.id,
      ammo: this.currentAmmo,
      reserve: this.reserveAmmo
    });
    
    return true;
  }
  
  _finishReload() {
    const ammoNeeded = this.stats.mag_size - this.currentAmmo;
    const ammoToAdd = Math.min(ammoNeeded, this.reserveAmmo);
    
    this.currentAmmo += ammoToAdd;
    this.reserveAmmo -= ammoToAdd;
    this.isReloading = false;
    this.reloadTime = 0;
    
    this._emitEvent('hud:update:ammo', {
      weapon: this.weaponData.id,
      current: this.currentAmmo,
      reserve: this.reserveAmmo,
      magSize: this.stats.mag_size
    });
  }
  
  setADS(active) {
    this.isADS = active;
    if (!active) {
      this.adsTransitionTime = this.adsProgress * (this.stats.ads_ms / 1000);
    } else {
      this.adsTransitionTime = (1 - this.adsProgress) * (this.stats.ads_ms / 1000);
    }
  }
  
  switchFireMode() {
    if (this.stats.fire_mode.length <= 1) return;
    
    const currentIndex = this.stats.fire_mode.indexOf(this.fireMode);
    const nextIndex = (currentIndex + 1) % this.stats.fire_mode.length;
    this.fireMode = this.stats.fire_mode[nextIndex];
    
    console.log(`Fire mode: ${this.fireMode}`);
  }
  
  unequip() {
    this.isEquipped = false;
    this.equipTime = 0;
  }
  
  equip() {
    this.equipTime = 0;
    // Equipment completes in update()
  }
  
  getDamageAtRange(range) {
    let damage = this.stats.dmg_body;
    
    // Apply damage falloff
    if (this.stats.falloff) {
      for (let i = 0; i < this.stats.falloff.length - 1; i++) {
        const current = this.stats.falloff[i];
        const next = this.stats.falloff[i + 1];
        
        if (range >= current.range && range < next.range) {
          // Interpolate between falloff points
          const t = (range - current.range) / (next.range - current.range);
          const mult = current.dmg_mult + (next.dmg_mult - current.dmg_mult) * t;
          damage *= mult;
          break;
        }
      }
      
      // Use last falloff if beyond range
      if (range >= this.stats.falloff[this.stats.falloff.length - 1].range) {
        damage *= this.stats.falloff[this.stats.falloff.length - 1].dmg_mult;
      }
    }
    
    return Math.round(damage);
  }
  
  getState() {
    return {
      currentAmmo: this.currentAmmo,
      reserveAmmo: this.reserveAmmo,
      isReloading: this.isReloading,
      isADS: this.isADS,
      adsProgress: this.adsProgress,
      fireMode: this.fireMode,
      isEquipped: this.isEquipped
    };
  }
  
  setState(state) {
    this.currentAmmo = state.currentAmmo;
    this.reserveAmmo = state.reserveAmmo;
    this.isReloading = state.isReloading;
    this.isADS = state.isADS;
    this.adsProgress = state.adsProgress;
    this.fireMode = state.fireMode;
    this.isEquipped = state.isEquipped;
  }
  
  _emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
  
  getCurrentWeaponStats() {
    return {
      id: this.weaponData.id,
      name: this.weaponData.name,
      ammo: this.currentAmmo,
      reserve: this.reserveAmmo,
      magSize: this.stats.mag_size,
      isReloading: this.isReloading,
      isADS: this.isADS,
      fireMode: this.fireMode,
      damage: this.stats.dmg_body,
      rpm: this.stats.rpm
    };
  }
}
