/**
 * CameraController - Smooth mouse look with ADS FOV scaling and sensitivity settings
 */
export class CameraController {
  constructor() {
    // Rotation in radians
    this.pitch = 0; // up/down (x-axis rotation)
    this.yaw = 0;   // left/right (y-axis rotation)
    
    // Rotation limits
    this.minPitch = -Math.PI / 2 + 0.01; // -89 degrees
    this.maxPitch = Math.PI / 2 - 0.01;  // +89 degrees
    
    // Field of view
    this.baseFOV = 90; // degrees
    this.currentFOV = this.baseFOV;
    this.adsFOV = 60; // degrees
    this.fovTransitionSpeed = 8.0;
    
    // Camera smoothing
    this.smoothing = 0.3;
    this.targetPitch = 0;
    this.targetYaw = 0;
    
    // Camera offset from player position
    this.eyeOffset = { x: 0, y: 0, z: 0 };
    
    // Weapon sway
    this.swayAmount = 0.02;
    this.swaySmooth = 0.1;
    this.currentSway = { x: 0, y: 0 };
    
    // Bob parameters
    this.bobAmount = 0.05;
    this.bobSpeed = 10;
    this.bobTime = 0;
    
    // Recoil accumulation
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.recoilRecoverySpeed = 8.0;
  }
  
  update(input, dt, isADS = false, isMoving = false) {
    // Get mouse delta
    const mouseDelta = input.getMouseDelta ? input.getMouseDelta(isADS) : input.look;
    
    if (mouseDelta) {
      // Apply mouse input to target rotation
      this.targetYaw += mouseDelta.x;
      this.targetPitch -= mouseDelta.y;
      
      // Clamp pitch
      this.targetPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetPitch));
    }
    
    // Smooth camera rotation
    const smoothFactor = 1.0 - Math.pow(1.0 - this.smoothing, dt * 60);
    this.yaw += (this.targetYaw - this.yaw) * smoothFactor;
    this.pitch += (this.targetPitch - this.pitch) * smoothFactor;
    
    // Apply recoil recovery
    this.recoilPitch *= Math.pow(1.0 - this.recoilRecoverySpeed * 0.1, dt * 60);
    this.recoilYaw *= Math.pow(1.0 - this.recoilRecoverySpeed * 0.1, dt * 60);
    
    // Update FOV for ADS
    const targetFOV = isADS ? this.adsFOV : this.baseFOV;
    this.currentFOV += (targetFOV - this.currentFOV) * this.fovTransitionSpeed * dt;
    
    // Update weapon sway based on mouse movement
    if (mouseDelta) {
      this.currentSway.x += (mouseDelta.x * this.swayAmount - this.currentSway.x) * this.swaySmooth;
      this.currentSway.y += (mouseDelta.y * this.swayAmount - this.currentSway.y) * this.swaySmooth;
    }
    
    // Update bob
    if (isMoving) {
      this.bobTime += dt * this.bobSpeed;
    } else {
      this.bobTime *= 0.9;
    }
  }
  
  applyRecoil(pitchKick, yawKick) {
    this.recoilPitch += pitchKick;
    this.recoilYaw += yawKick;
    this.targetPitch += pitchKick;
    this.targetYaw += yawKick;
    
    // Clamp pitch after recoil
    this.targetPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetPitch));
  }
  
  getViewDirection() {
    // Calculate forward vector from yaw and pitch
    const cosPitch = Math.cos(this.pitch + this.recoilPitch);
    const sinPitch = Math.sin(this.pitch + this.recoilPitch);
    const cosYaw = Math.cos(this.yaw + this.recoilYaw);
    const sinYaw = Math.sin(this.yaw + this.recoilYaw);
    
    return {
      x: cosPitch * sinYaw,
      y: sinPitch,
      z: -cosPitch * cosYaw
    };
  }
  
  getRightVector() {
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);
    
    return {
      x: cosYaw,
      y: 0,
      z: sinYaw
    };
  }
  
  getForwardVector() {
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);
    
    return {
      x: sinYaw,
      y: 0,
      z: -cosYaw
    };
  }
  
  getBobOffset() {
    return {
      x: Math.sin(this.bobTime) * this.bobAmount,
      y: Math.abs(Math.sin(this.bobTime * 2)) * this.bobAmount,
      z: 0
    };
  }
  
  getSwayOffset() {
    return {
      x: this.currentSway.x,
      y: this.currentSway.y,
      z: 0
    };
  }
  
  getFOV() {
    return this.currentFOV;
  }
  
  getRotation() {
    return {
      pitch: this.pitch + this.recoilPitch,
      yaw: this.yaw + this.recoilYaw
    };
  }
  
  setRotation(pitch, yaw) {
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, pitch));
    this.yaw = yaw;
    this.targetPitch = this.pitch;
    this.targetYaw = this.yaw;
  }
  
  reset() {
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.currentSway = { x: 0, y: 0 };
    this.bobTime = 0;
  }
}
