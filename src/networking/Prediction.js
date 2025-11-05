/**
 * Prediction - Client-side prediction for responsive movement
 */

export class PredictionSystem {
  constructor() {
    this.inputHistory = [];
    this.maxHistorySize = 120; // 2 seconds at 60Hz
    this.inputSequence = 0;
    this.predictedState = null;
  }
  
  /**
   * Initialize with current state
   */
  init(initialState) {
    this.predictedState = {
      position: { ...initialState.position },
      velocity: { ...initialState.velocity },
      rotation: { ...initialState.rotation },
      grounded: initialState.grounded || true,
      crouched: initialState.crouched || false,
      sprinting: initialState.sprinting || false,
    };
  }
  
  /**
   * Apply input and predict state
   */
  applyInput(input, actions, deltaTime) {
    if (!this.predictedState) {
      console.warn('Prediction not initialized');
      return null;
    }
    
    // Store input in history
    this.inputSequence++;
    this.inputHistory.push({
      seq: this.inputSequence,
      input: { ...input },
      actions: { ...actions },
      deltaTime,
      timestamp: Date.now(),
    });
    
    // Trim history
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }
    
    // Predict new state
    this.predictState(input, actions, deltaTime);
    
    return {
      seq: this.inputSequence,
      state: { ...this.predictedState },
    };
  }
  
  /**
   * Predict state based on input (mirrors server logic)
   */
  predictState(input, actions, dt) {
    const state = this.predictedState;
    
    // Update rotation
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
    
    // ADS movement penalty
    if (actions.ads) {
      speed *= 0.7;
    }
    
    // Calculate movement in world space
    const forward = {
      x: Math.sin(state.rotation.y),
      z: Math.cos(state.rotation.y),
    };
    
    const right = {
      x: Math.cos(state.rotation.y),
      z: -Math.sin(state.rotation.y),
    };
    
    // Desired velocity
    const desiredVelocity = {
      x: (forward.x * input.move.z + right.x * input.move.x) * speed,
      y: state.velocity.y,
      z: (forward.z * input.move.z + right.z * input.move.x) * speed,
    };
    
    // Apply acceleration
    const acceleration = state.grounded ? 30.0 : 5.0;
    
    state.velocity.x = this.lerp(state.velocity.x, desiredVelocity.x, acceleration * dt);
    state.velocity.z = this.lerp(state.velocity.z, desiredVelocity.z, acceleration * dt);
    
    // Apply gravity
    if (!state.grounded) {
      state.velocity.y -= 20.0 * dt;
    } else {
      state.velocity.y = 0;
      
      // Jump
      if (actions.jump) {
        state.velocity.y = 7.0;
        state.grounded = false;
      }
    }
    
    // Update position
    state.position.x += state.velocity.x * dt;
    state.position.y += state.velocity.y * dt;
    state.position.z += state.velocity.z * dt;
    
    // Ground check
    if (state.position.y <= 0) {
      state.position.y = 0;
      state.velocity.y = 0;
      state.grounded = true;
    } else if (state.velocity.y < 0 && state.position.y < 0.1) {
      state.grounded = true;
    } else if (state.velocity.y > 0.1) {
      state.grounded = false;
    }
    
    // Map boundaries
    const bounds = 100;
    state.position.x = Math.max(-bounds, Math.min(bounds, state.position.x));
    state.position.z = Math.max(-bounds, Math.min(bounds, state.position.z));
    state.position.y = Math.max(0, Math.min(50, state.position.y));
  }
  
  /**
   * Get predicted state
   */
  getState() {
    return this.predictedState ? { ...this.predictedState } : null;
  }
  
  /**
   * Get input by sequence
   */
  getInput(seq) {
    return this.inputHistory.find(entry => entry.seq === seq);
  }
  
  /**
   * Get inputs since sequence
   */
  getInputsSince(seq) {
    return this.inputHistory.filter(entry => entry.seq > seq);
  }
  
  /**
   * Clear old inputs
   */
  clearOldInputs(ackSeq) {
    this.inputHistory = this.inputHistory.filter(entry => entry.seq > ackSeq);
  }
  
  /**
   * Linear interpolation
   */
  lerp(a, b, t) {
    return a + (b - a) * Math.min(1, t);
  }
  
  /**
   * Reset prediction
   */
  reset() {
    this.inputHistory = [];
    this.inputSequence = 0;
    this.predictedState = null;
  }
}

export default PredictionSystem;
