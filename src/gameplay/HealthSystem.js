/**
 * HealthSystem - HP, shields (optional), and regeneration
 */
export class HealthSystem {
  constructor(maxHealth = 100, config = {}) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    
    // Shield system (optional)
    this.hasShields = config.enableShields || false;
    this.maxShield = config.maxShield || 50;
    this.currentShield = this.hasShields ? this.maxShield : 0;
    
    // Regeneration
    this.healthRegenEnabled = config.healthRegen || false;
    this.healthRegenDelay = config.healthRegenDelay || 5.0; // seconds
    this.healthRegenRate = config.healthRegenRate || 10; // hp per second
    this.timeSinceLastDamage = 0;
    
    this.shieldRegenEnabled = config.shieldRegen || true;
    this.shieldRegenDelay = config.shieldRegenDelay || 3.0;
    this.shieldRegenRate = config.shieldRegenRate || 20;
    
    // State
    this.isAlive = true;
    this.isDead = false;
    
    // Damage tracking
    this.lastDamageAmount = 0;
    this.lastDamageSource = null;
  }
  
  update(dt) {
    if (!this.isAlive) return;
    
    this.timeSinceLastDamage += dt;
    
    // Shield regeneration
    if (this.hasShields && this.shieldRegenEnabled && 
        this.currentShield < this.maxShield) {
      if (this.timeSinceLastDamage >= this.shieldRegenDelay) {
        this.currentShield += this.shieldRegenRate * dt;
        this.currentShield = Math.min(this.maxShield, this.currentShield);
        
        this._emitEvent('hud:update:health', this.getHealthData());
      }
    }
    
    // Health regeneration
    if (this.healthRegenEnabled && this.currentHealth < this.maxHealth) {
      if (this.timeSinceLastDamage >= this.healthRegenDelay) {
        this.currentHealth += this.healthRegenRate * dt;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth);
        
        this._emitEvent('hud:update:health', this.getHealthData());
      }
    }
  }
  
  takeDamage(amount, source = null, damageType = 'bullet') {
    if (!this.isAlive || amount <= 0) return false;
    
    this.lastDamageAmount = amount;
    this.lastDamageSource = source;
    this.timeSinceLastDamage = 0;
    
    let remainingDamage = amount;
    
    // Shields absorb damage first
    if (this.hasShields && this.currentShield > 0) {
      const shieldDamage = Math.min(this.currentShield, remainingDamage);
      this.currentShield -= shieldDamage;
      remainingDamage -= shieldDamage;
      
      if (this.currentShield <= 0) {
        this._emitEvent('player:shield:broken', { source });
      }
    }
    
    // Apply remaining damage to health
    if (remainingDamage > 0) {
      this.currentHealth -= remainingDamage;
    }
    
    // Emit damage event
    this._emitEvent('damage:local', {
      amount,
      remainingHealth: this.currentHealth,
      remainingShield: this.currentShield,
      source,
      type: damageType
    });
    
    this._emitEvent('hud:update:health', this.getHealthData());
    
    // Check for death
    if (this.currentHealth <= 0) {
      this._die(source);
      return true;
    }
    
    return false;
  }
  
  heal(amount) {
    if (!this.isAlive) return false;
    
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    
    if (this.currentHealth > oldHealth) {
      this._emitEvent('player:healed', {
        amount: this.currentHealth - oldHealth,
        currentHealth: this.currentHealth
      });
      
      this._emitEvent('hud:update:health', this.getHealthData());
      return true;
    }
    
    return false;
  }
  
  rechargeShield(amount) {
    if (!this.isAlive || !this.hasShields) return false;
    
    const oldShield = this.currentShield;
    this.currentShield = Math.min(this.maxShield, this.currentShield + amount);
    
    if (this.currentShield > oldShield) {
      this._emitEvent('player:shield:recharged', {
        amount: this.currentShield - oldShield,
        currentShield: this.currentShield
      });
      
      this._emitEvent('hud:update:health', this.getHealthData());
      return true;
    }
    
    return false;
  }
  
  _die(source) {
    this.isAlive = false;
    this.isDead = true;
    this.currentHealth = 0;
    
    this._emitEvent('player:death', {
      source,
      lastDamage: this.lastDamageAmount
    });
    
    this._emitEvent('hud:update:health', this.getHealthData());
  }
  
  respawn(position = null) {
    this.isAlive = true;
    this.isDead = false;
    this.currentHealth = this.maxHealth;
    this.currentShield = this.hasShields ? this.maxShield : 0;
    this.timeSinceLastDamage = 0;
    
    this._emitEvent('player:respawn', { position });
    this._emitEvent('hud:update:health', this.getHealthData());
  }
  
  getHealthPercent() {
    return (this.currentHealth / this.maxHealth) * 100;
  }
  
  getShieldPercent() {
    if (!this.hasShields) return 0;
    return (this.currentShield / this.maxShield) * 100;
  }
  
  getHealthData() {
    return {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      healthPercent: this.getHealthPercent(),
      shield: this.currentShield,
      maxShield: this.maxShield,
      shieldPercent: this.getShieldPercent(),
      isAlive: this.isAlive
    };
  }
  
  getState() {
    return {
      currentHealth: this.currentHealth,
      currentShield: this.currentShield,
      isAlive: this.isAlive,
      timeSinceLastDamage: this.timeSinceLastDamage
    };
  }
  
  setState(state) {
    this.currentHealth = state.currentHealth;
    this.currentShield = state.currentShield;
    this.isAlive = state.isAlive;
    this.isDead = !state.isAlive;
    this.timeSinceLastDamage = state.timeSinceLastDamage;
  }
  
  _emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
}
