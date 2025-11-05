/**
 * Reconciliation - State reconciliation with server corrections
 */

export class ReconciliationSystem {
  constructor(predictionSystem) {
    this.predictionSystem = predictionSystem;
    this.smoothingEnabled = true;
    this.smoothingFactor = 0.1; // Lower = more smoothing
    this.errorThreshold = 0.5; // Minimum error to trigger correction
  }
  
  /**
   * Reconcile client state with server snapshot
   */
  reconcile(serverState, ackSeq) {
    if (!this.predictionSystem.predictedState) {
      // First state from server - initialize prediction
      this.predictionSystem.init(serverState);
      return {
        corrected: true,
        error: 0,
        method: 'initialize',
      };
    }
    
    // Get our predicted state at the acknowledged sequence
    const predictedAtAck = this.predictionSystem.getInput(ackSeq);
    
    if (!predictedAtAck) {
      // No history for this sequence - accept server state
      this.predictionSystem.predictedState.position = { ...serverState.position };
      this.predictionSystem.predictedState.velocity = { ...serverState.velocity };
      
      return {
        corrected: true,
        error: 0,
        method: 'no_history',
      };
    }
    
    // Calculate position error
    const error = this.calculateError(
      this.predictionSystem.predictedState.position,
      serverState.position
    );
    
    // Only correct if error is significant
    if (error < this.errorThreshold) {
      return {
        corrected: false,
        error,
        method: 'within_threshold',
      };
    }
    
    // Apply correction
    if (this.smoothingEnabled) {
      this.smoothCorrection(serverState, error);
    } else {
      this.snapCorrection(serverState);
    }
    
    // Replay inputs since acknowledged sequence
    this.replayInputs(ackSeq);
    
    return {
      corrected: true,
      error,
      method: this.smoothingEnabled ? 'smooth' : 'snap',
    };
  }
  
  /**
   * Calculate position error
   */
  calculateError(predicted, actual) {
    const dx = predicted.x - actual.x;
    const dy = predicted.y - actual.y;
    const dz = predicted.z - actual.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Apply smooth correction
   */
  smoothCorrection(serverState, error) {
    const state = this.predictionSystem.predictedState;
    
    // Interpolate towards server state
    const factor = Math.min(1, error * this.smoothingFactor);
    
    state.position.x = this.lerp(state.position.x, serverState.position.x, factor);
    state.position.y = this.lerp(state.position.y, serverState.position.y, factor);
    state.position.z = this.lerp(state.position.z, serverState.position.z, factor);
    
    // Also correct velocity for better physics
    if (serverState.velocity) {
      state.velocity.x = this.lerp(state.velocity.x, serverState.velocity.x, factor * 0.5);
      state.velocity.y = this.lerp(state.velocity.y, serverState.velocity.y, factor * 0.5);
      state.velocity.z = this.lerp(state.velocity.z, serverState.velocity.z, factor * 0.5);
    }
    
    // Copy other state
    if (serverState.rotation) {
      state.rotation = { ...serverState.rotation };
    }
    if (serverState.grounded !== undefined) {
      state.grounded = serverState.grounded;
    }
  }
  
  /**
   * Apply snap correction (instant)
   */
  snapCorrection(serverState) {
    const state = this.predictionSystem.predictedState;
    
    state.position = { ...serverState.position };
    state.velocity = { ...serverState.velocity };
    state.rotation = { ...serverState.rotation };
    state.grounded = serverState.grounded;
    state.crouched = serverState.crouched;
    state.sprinting = serverState.sprinting;
  }
  
  /**
   * Replay inputs since acknowledged sequence
   */
  replayInputs(ackSeq) {
    const inputsToReplay = this.predictionSystem.getInputsSince(ackSeq);
    
    for (const entry of inputsToReplay) {
      this.predictionSystem.predictState(entry.input, entry.actions, entry.deltaTime);
    }
    
    // Clear old inputs
    this.predictionSystem.clearOldInputs(ackSeq);
  }
  
  /**
   * Linear interpolation
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  /**
   * Enable/disable smoothing
   */
  setSmoothing(enabled) {
    this.smoothingEnabled = enabled;
  }
  
  /**
   * Set smoothing factor
   */
  setSmoothingFactor(factor) {
    this.smoothingFactor = Math.max(0.01, Math.min(1, factor));
  }
  
  /**
   * Set error threshold
   */
  setErrorThreshold(threshold) {
    this.errorThreshold = Math.max(0, threshold);
  }
}

export default ReconciliationSystem;
