/**
 * Movement - Server-authoritative movement with validation and reconciliation
 */

import { parseActionMask, Validation } from '../protocol/Schema.js';

export class MovementSystem {
  constructor() {
    this.playerStates = new Map();
    this.inputBuffer = new Map(); // Store recent inputs for reconciliation
    this.maxInputHistory = 60; // Keep last 60 inputs (~1 second at 60Hz)
  }
  
  /**
   * Initialize player movement state
   */
  initPlayer(playerId, position = { x: 0, y: 0, z: 0 }) {
    this.playerStates.set(playerId, {
      position: { ...position },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      grounded: true,
      crouched: false,
      sprinting: false,
      lastInputSeq: 0,
      lastUpdateTime: Date.now(),
    });
    
    this.inputBuffer.set(playerId, []);
  }
  
  /**
   * Remove player state
   */
  removePlayer(playerId) {
    this.playerStates.delete(playerId);
    this.inputBuffer.delete(playerId);
  }
  
  /**
   * Process player input
   */
  processInput(playerId, input) {
    const state = this.playerStates.get(playerId);
    if (!state) return null;
    
    // Validate input sequence
    if (input.seq <= state.lastInputSeq) {
      return null; // Out of order or duplicate
    }
    
    // Parse actions
    const actions = parseActionMask(input.actions);
    
    // Validate delta time
    const dt = Math.min(input.dt, 0.1); // Cap at 100ms
    
    // Validate movement vector
    const moveLength = Math.sqrt(
      input.move.x * input.move.x + 
      input.move.y * input.move.y + 
      input.move.z * input.move.z
    );
    
    if (moveLength > 1.1) { // Normalize with tolerance
      input.move.x /= moveLength;
      input.move.y /= moveLength;
      input.move.z /= moveLength;
    }
    
    // Store input for reconciliation
    const buffer = this.inputBuffer.get(playerId);
    buffer.push({
      seq: input.seq,
      input,
      state: this.cloneState(state),
      timestamp: Date.now(),
    });
    
    // Trim buffer
    if (buffer.length > this.maxInputHistory) {
      buffer.shift();
    }
    
    // Apply input to state
    this.applyInput(state, input, actions, dt);
    
    state.lastInputSeq = input.seq;
    state.lastUpdateTime = Date.now();
    
    return this.cloneState(state);
  }
  
  /**
   * Apply input to state
   */
  applyInput(state, input, actions, dt) {
    // Update rotation (look)
    state.rotation.x = input.look.x;
    state.rotation.y = input.look.y;
    
    // Determine movement speed
    let speed = 5.0; // Base walk speed
    
    if (actions.sprint && !actions.crouch) {
      speed = 8.0;
      state.sprinting = true;
      state.crouched = false;
    } else if (actions.crouch) {
      speed = 3.0;
      state.crouched = true;
      state.sprinting = false;
    } else {
      state.sprinting = false;
      state.crouched = false;
    }
    
    // Apply ADS movement penalty
    if (actions.ads) {
      speed *= 0.7;
    }
    
    // Calculate movement vector in world space
    const forward = {
      x: Math.sin(state.rotation.y),
      z: Math.cos(state.rotation.y),
    };
    
    const right = {
      x: Math.cos(state.rotation.y),
      z: -Math.sin(state.rotation.y),
    };
    
    // Calculate desired velocity
    const desiredVelocity = {
      x: (forward.x * input.move.z + right.x * input.move.x) * speed,
      y: state.velocity.y,
      z: (forward.z * input.move.z + right.z * input.move.x) * speed,
    };
    
    // Apply acceleration (smooth movement)
    const acceleration = state.grounded ? 30.0 : 5.0; // Higher when grounded
    
    state.velocity.x = this.lerp(state.velocity.x, desiredVelocity.x, acceleration * dt);
    state.velocity.z = this.lerp(state.velocity.z, desiredVelocity.z, acceleration * dt);
    
    // Apply gravity
    if (!state.grounded) {
      state.velocity.y -= 20.0 * dt; // Gravity
    } else {
      state.velocity.y = 0;
      
      // Jump
      if (actions.jump) {
        state.velocity.y = 7.0; // Jump velocity
        state.grounded = false;
      }
    }
    
    // Update position
    state.position.x += state.velocity.x * dt;
    state.position.y += state.velocity.y * dt;
    state.position.z += state.velocity.z * dt;
    
    // Simple ground check
    if (state.position.y <= 0) {
      state.position.y = 0;
      state.velocity.y = 0;
      state.grounded = true;
    } else if (state.velocity.y < 0 && state.position.y < 0.1) {
      state.grounded = true;
    } else if (state.velocity.y > 0.1) {
      state.grounded = false;
    }
    
    // Map boundaries (simple box for now)
    const bounds = 100;
    state.position.x = Math.max(-bounds, Math.min(bounds, state.position.x));
    state.position.z = Math.max(-bounds, Math.min(bounds, state.position.z));
    state.position.y = Math.max(0, Math.min(50, state.position.y));
  }
  
  /**
   * Get state for reconciliation
   */
  getStateForReconciliation(playerId, ackSeq) {
    const buffer = this.inputBuffer.get(playerId);
    if (!buffer) return null;
    
    // Find the acknowledged input
    const ackInput = buffer.find(entry => entry.seq === ackSeq);
    
    if (ackInput) {
      return {
        seq: ackSeq,
        state: this.cloneState(ackInput.state),
      };
    }
    
    return null;
  }
  
  /**
   * Get current player state
   */
  getState(playerId) {
    const state = this.playerStates.get(playerId);
    return state ? this.cloneState(state) : null;
  }
  
  /**
   * Set player position (for spawning, teleporting)
   */
  setPosition(playerId, position) {
    const state = this.playerStates.get(playerId);
    if (state) {
      state.position = { ...position };
      state.velocity = { x: 0, y: 0, z: 0 };
      state.grounded = true;
    }
  }
  
  /**
   * Validate movement (anti-cheat helper)
   */
  validateMovement(playerId, reportedPosition, deltaTime) {
    const state = this.playerStates.get(playerId);
    if (!state) return { valid: true };
    
    // Check if position is reasonable based on velocity and time
    const maxDistance = Validation.MAX_MOVE_SPEED * deltaTime * 1.5; // 50% tolerance
    
    const dx = reportedPosition.x - state.position.x;
    const dy = reportedPosition.y - state.position.y;
    const dz = reportedPosition.z - state.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance > maxDistance) {
      return {
        valid: false,
        reason: 'Position mismatch',
        expected: state.position,
        reported: reportedPosition,
        distance,
        maxDistance,
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Get all player states (for snapshot)
   */
  getAllStates() {
    const states = {};
    for (const [playerId, state] of this.playerStates) {
      states[playerId] = this.cloneState(state);
    }
    return states;
  }
  
  /**
   * Tick update (physics simulation for things like falling)
   */
  tick(deltaTime) {
    for (const [playerId, state] of this.playerStates) {
      const timeSinceUpdate = (Date.now() - state.lastUpdateTime) / 1000;
      
      // If no input for a while, apply gravity
      if (timeSinceUpdate > 0.1) {
        if (!state.grounded) {
          state.velocity.y -= 20.0 * deltaTime;
          state.position.y += state.velocity.y * deltaTime;
          
          if (state.position.y <= 0) {
            state.position.y = 0;
            state.velocity.y = 0;
            state.grounded = true;
          }
        }
      }
    }
  }
  
  /**
   * Clone state for immutability
   */
  cloneState(state) {
    return {
      position: { ...state.position },
      velocity: { ...state.velocity },
      rotation: { ...state.rotation },
      grounded: state.grounded,
      crouched: state.crouched,
      sprinting: state.sprinting,
      lastInputSeq: state.lastInputSeq,
      lastUpdateTime: state.lastUpdateTime,
    };
  }
  
  /**
   * Linear interpolation helper
   */
  lerp(a, b, t) {
    return a + (b - a) * Math.min(1, t);
  }
}

// Singleton instance
export const movementSystem = new MovementSystem();
