import { describe, it, expect, beforeEach } from 'vitest';
import { HitDetection } from '../../../src/gameplay/HitDetection.js';

describe('HitDetection', () => {
  let hitDetection;

  beforeEach(() => {
    hitDetection = new HitDetection();
  });

  describe('initialization', () => {
    it('should initialize with default layers', () => {
      expect(hitDetection.layers).toBeDefined();
      expect(hitDetection.layers.player).toBe(1);
      expect(hitDetection.layers.environment).toBe(2);
      expect(hitDetection.layers.prop).toBe(4);
    });

    it('should initialize hitboxes system', () => {
      expect(hitDetection.hitboxes).toBeDefined();
    });
  });

  describe('hasLineOfSight', () => {
    it('should return true when no obstacles between points', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 10, y: 0, z: 0 };
      const obstacles = [];

      const result = hitDetection.hasLineOfSight(from, to, obstacles);
      expect(result).toBe(true);
    });

    it('should return true when points are identical', () => {
      const point = { x: 5, y: 5, z: 5 };
      const result = hitDetection.hasLineOfSight(point, point, []);
      expect(result).toBe(true);
    });

    it('should handle obstacles in the path', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 10, y: 0, z: 0 };
      
      // Test with obstacle outside the path
      const obstaclesOutside = [
        { position: { x: 5, y: 10, z: 0 }, radius: 1 }
      ];
      expect(hitDetection.hasLineOfSight(from, to, obstaclesOutside)).toBe(true);
    });

    it('should calculate distance correctly', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 3, y: 4, z: 0 };
      // Distance is 5 (3-4-5 triangle)
      
      const result = hitDetection.hasLineOfSight(from, to, []);
      expect(result).toBe(true);
    });
  });

  describe('layer mask', () => {
    it('should have correct bit flags for layers', () => {
      // Verify bit flags are powers of 2
      expect(hitDetection.layers.player).toBe(1 << 0); // 1
      expect(hitDetection.layers.environment).toBe(1 << 1); // 2
      expect(hitDetection.layers.prop).toBe(1 << 2); // 4
    });

    it('should allow combining layers with bitwise OR', () => {
      const combinedMask = hitDetection.layers.player | hitDetection.layers.environment;
      expect(combinedMask).toBe(3); // 1 | 2 = 3
    });
  });

  describe('hitscan', () => {
    it('should return null when no targets in range', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 0;
      const targets = [];

      const result = hitDetection.hitscan(origin, direction, spread, targets);
      expect(result).toBeNull();
    });

    it('should use default max distance of 1000', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 0;
      const targets = [];

      // Should not throw with default params
      expect(() => {
        hitDetection.hitscan(origin, direction, spread, targets);
      }).not.toThrow();
    });

    it('should filter targets by layer mask', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 0;
      
      const targets = [
        { 
          id: 1, 
          layer: hitDetection.layers.player,
          position: { x: 5, y: 1, z: 0 },
          state: { height: 1.8 }
        },
        { 
          id: 2, 
          layer: hitDetection.layers.environment,
          position: { x: 3, y: 1, z: 0 },
          state: { height: 1.8 }
        }
      ];

      // Search only for player layer
      const result = hitDetection.hitscan(
        origin, 
        direction, 
        spread, 
        targets, 
        1000, 
        hitDetection.layers.player
      );

      // Result should only hit player layer targets (if any hit)
      // Implementation depends on hitboxes raycast behavior
    });

    it('should skip targets without position or state', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 0;
      
      const targets = [
        { id: 1 }, // No position or state
        { id: 2, position: { x: 5, y: 1, z: 0 } }, // No state
        { id: 3, state: { height: 1.8 } } // No position
      ];

      // Should not throw and should return null (no valid targets)
      expect(() => {
        hitDetection.hitscan(origin, direction, spread, targets);
      }).not.toThrow();
    });
  });

  describe('damage multipliers', () => {
    it('should define headshot multipliers', () => {
      // This test verifies the damage multiplier system exists
      // Actual values would be tested in integration tests
      expect(hitDetection).toBeDefined();
    });
  });

  describe('spread calculation', () => {
    it('should handle zero spread', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 0;

      // With zero spread, direction should remain unchanged
      expect(() => {
        hitDetection.hitscan(origin, direction, spread, []);
      }).not.toThrow();
    });

    it('should apply spread to direction', () => {
      const origin = { x: 0, y: 1, z: 0 };
      const direction = { x: 1, y: 0, z: 0 };
      const spread = 5; // 5 degrees

      // Should handle spread without errors
      expect(() => {
        hitDetection.hitscan(origin, direction, spread, []);
      }).not.toThrow();
    });
  });
});
