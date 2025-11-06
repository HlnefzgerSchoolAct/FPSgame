import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthSystem } from '../../../src/gameplay/HealthSystem.js';

describe('HealthSystem', () => {
  let healthSystem;

  beforeEach(() => {
    healthSystem = new HealthSystem(100, {
      enableShields: false,
      healthRegen: true,
      healthRegenDelay: 5.0,
      healthRegenRate: 10
    });
  });

  describe('initialization', () => {
    it('should initialize with max health', () => {
      expect(healthSystem.currentHealth).toBe(100);
      expect(healthSystem.maxHealth).toBe(100);
      expect(healthSystem.isAlive).toBe(true);
      expect(healthSystem.isDead).toBe(false);
    });

    it('should initialize with shields when enabled', () => {
      const systemWithShields = new HealthSystem(100, {
        enableShields: true,
        maxShield: 50
      });
      expect(systemWithShields.hasShields).toBe(true);
      expect(systemWithShields.currentShield).toBe(50);
      expect(systemWithShields.maxShield).toBe(50);
    });

    it('should not have shields when disabled', () => {
      expect(healthSystem.hasShields).toBe(false);
      expect(healthSystem.currentShield).toBe(0);
    });
  });

  describe('takeDamage', () => {
    it('should reduce health by damage amount', () => {
      const died = healthSystem.takeDamage(30);
      expect(healthSystem.currentHealth).toBe(70);
      expect(died).toBe(false);
    });

    it('should return true and set isDead when health reaches zero', () => {
      const died = healthSystem.takeDamage(100);
      expect(healthSystem.currentHealth).toBe(0);
      expect(healthSystem.isAlive).toBe(false);
      expect(healthSystem.isDead).toBe(true);
      expect(died).toBe(true);
    });

    it('should return true and set isDead when damage exceeds health', () => {
      const died = healthSystem.takeDamage(150);
      expect(healthSystem.currentHealth).toBeLessThanOrEqual(0);
      expect(healthSystem.isAlive).toBe(false);
      expect(healthSystem.isDead).toBe(true);
      expect(died).toBe(true);
    });

    it('should not apply damage when already dead', () => {
      healthSystem.takeDamage(100);
      const currentHealth = healthSystem.currentHealth;
      healthSystem.takeDamage(20);
      expect(healthSystem.currentHealth).toBe(currentHealth);
    });

    it('should not apply damage when amount is zero or negative', () => {
      healthSystem.takeDamage(0);
      expect(healthSystem.currentHealth).toBe(100);
      healthSystem.takeDamage(-10);
      expect(healthSystem.currentHealth).toBe(100);
    });

    it('should reset time since last damage', () => {
      healthSystem.timeSinceLastDamage = 5.0;
      healthSystem.takeDamage(10);
      expect(healthSystem.timeSinceLastDamage).toBe(0);
    });

    it('should track last damage source', () => {
      const source = { playerId: 'player123' };
      healthSystem.takeDamage(30, source);
      expect(healthSystem.lastDamageSource).toBe(source);
      expect(healthSystem.lastDamageAmount).toBe(30);
    });
  });

  describe('shields', () => {
    beforeEach(() => {
      healthSystem = new HealthSystem(100, {
        enableShields: true,
        maxShield: 50,
        shieldRegen: true,
        shieldRegenDelay: 3.0,
        shieldRegenRate: 20
      });
    });

    it('should absorb damage with shields first', () => {
      healthSystem.takeDamage(30);
      expect(healthSystem.currentShield).toBe(20);
      expect(healthSystem.currentHealth).toBe(100);
    });

    it('should apply remaining damage to health after shields depleted', () => {
      healthSystem.takeDamage(70);
      expect(healthSystem.currentShield).toBe(0);
      expect(healthSystem.currentHealth).toBe(80);
    });

    it('should regenerate shields after delay', () => {
      healthSystem.takeDamage(30);
      expect(healthSystem.currentShield).toBe(20);
      
      // Update for regen delay
      healthSystem.update(3.5);
      expect(healthSystem.currentShield).toBeGreaterThan(20);
      expect(healthSystem.currentShield).toBeLessThanOrEqual(50);
    });

    it('should not regenerate shields before delay', () => {
      healthSystem.takeDamage(30);
      expect(healthSystem.currentShield).toBe(20);
      
      healthSystem.update(2.0);
      expect(healthSystem.currentShield).toBe(20);
    });

    it('should cap shield regeneration at max shield', () => {
      healthSystem.takeDamage(50);
      expect(healthSystem.currentShield).toBe(0);
      
      // Regen for a long time
      healthSystem.update(10.0);
      expect(healthSystem.currentShield).toBe(50);
    });
  });

  describe('health regeneration', () => {
    it('should regenerate health after delay', () => {
      healthSystem.takeDamage(50);
      expect(healthSystem.currentHealth).toBe(50);
      
      // Update for regen delay + some regen time
      healthSystem.update(6.0);
      expect(healthSystem.currentHealth).toBeGreaterThan(50);
      expect(healthSystem.currentHealth).toBeLessThanOrEqual(100);
    });

    it('should not regenerate health before delay', () => {
      healthSystem.takeDamage(50);
      expect(healthSystem.currentHealth).toBe(50);
      
      healthSystem.update(4.0);
      expect(healthSystem.currentHealth).toBe(50);
    });

    it('should cap health regeneration at max health', () => {
      healthSystem.takeDamage(50);
      expect(healthSystem.currentHealth).toBe(50);
      
      // Regen for a long time
      healthSystem.update(20.0);
      expect(healthSystem.currentHealth).toBe(100);
    });

    it('should not regenerate when disabled', () => {
      const noRegenSystem = new HealthSystem(100, {
        healthRegen: false
      });
      noRegenSystem.takeDamage(50);
      noRegenSystem.update(10.0);
      expect(noRegenSystem.currentHealth).toBe(50);
    });
  });

  describe('heal', () => {
    it('should restore health', () => {
      healthSystem.takeDamage(50);
      healthSystem.heal(30);
      expect(healthSystem.currentHealth).toBe(80);
    });

    it('should not exceed max health', () => {
      healthSystem.takeDamage(20);
      healthSystem.heal(50);
      expect(healthSystem.currentHealth).toBe(100);
    });

    it('should not heal when dead', () => {
      healthSystem.takeDamage(100);
      healthSystem.heal(50);
      expect(healthSystem.currentHealth).toBeLessThanOrEqual(0);
    });
  });

  describe('respawn', () => {
    it('should reset health and shields to max', () => {
      const systemWithShields = new HealthSystem(100, {
        enableShields: true,
        maxShield: 50
      });
      // Deal enough damage to kill (shields 50 + health 100 = 150 total)
      systemWithShields.takeDamage(200);
      expect(systemWithShields.isDead).toBe(true);
      expect(systemWithShields.isAlive).toBe(false);
      
      systemWithShields.respawn();
      expect(systemWithShields.currentHealth).toBe(100);
      expect(systemWithShields.currentShield).toBe(50);
      expect(systemWithShields.isAlive).toBe(true);
      expect(systemWithShields.isDead).toBe(false);
    });

    it('should reset timeSinceLastDamage', () => {
      healthSystem.takeDamage(30, { playerId: 'enemy' });
      healthSystem.timeSinceLastDamage = 5.0;
      healthSystem.respawn();
      expect(healthSystem.timeSinceLastDamage).toBe(0);
    });
  });

  describe('getHealthData', () => {
    it('should return current health data', () => {
      // Create a fresh system without shields for this test
      const noShieldSystem = new HealthSystem(100, {
        enableShields: false
      });
      const data = noShieldSystem.getHealthData();
      expect(data.health).toBe(100);
      expect(data.maxHealth).toBe(100);
      expect(data.healthPercent).toBe(100);
      expect(data.shield).toBe(0);
      expect(data.shieldPercent).toBe(0);
      expect(data.isAlive).toBe(true);
    });

    it('should calculate percentages correctly', () => {
      healthSystem.takeDamage(50);
      const data = healthSystem.getHealthData();
      expect(data.healthPercent).toBe(50);
    });

    it('should include shield data when enabled', () => {
      const systemWithShields = new HealthSystem(100, {
        enableShields: true,
        maxShield: 50
      });
      systemWithShields.takeDamage(25);
      const data = systemWithShields.getHealthData();
      expect(data.shield).toBe(25);
      expect(data.maxShield).toBe(50);
      expect(data.shieldPercent).toBe(50);
    });
  });
});
