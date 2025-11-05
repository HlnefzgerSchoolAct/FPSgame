/**
 * PlayerController - First-person movement controller
 * Handles walk, sprint, crouch, jump, slide, air control, and slope handling
 */
export class PlayerController {
  constructor(position = { x: 0, y: 1.8, z: 0 }) {
    // Position and velocity
    this.position = { ...position };
    this.velocity = { x: 0, y: 0, z: 0 };
    
    // Movement parameters
    this.walkSpeed = 4.5;
    this.sprintSpeed = 7.0;
    this.crouchSpeed = 2.5;
    this.slideSpeed = 9.0;
    this.slideDecay = 0.92;
    this.airControlFactor = 0.3;
    
    // Jump parameters
    this.jumpForce = 7.5;
    this.gravity = 22.0;
    
    // State
    this.isGrounded = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.isSliding = false;
    this.canJump = true;
    this.slideTimer = 0;
    this.maxSlideTime = 0.8; // seconds
    
    // Dimensions
    this.standHeight = 1.8;
    this.crouchHeight = 1.2;
    this.currentHeight = this.standHeight;
    this.capsuleRadius = 0.4;
    
    // Slope handling
    this.maxSlopeAngle = 45; // degrees
    this.slopeForce = 8.0;
    
    // Movement smoothing
    this.acceleration = 20.0;
    this.friction = 12.0;
    this.airFriction = 0.5;
  }
  
  update(input, dt, collisionCheck) {
    // Update movement state
    this._updateMovementState(input);
    
    // Apply movement
    this._applyMovement(input, dt);
    
    // Apply gravity
    this._applyGravity(dt);
    
    // Check ground collision
    this.isGrounded = collisionCheck ? 
      collisionCheck.isGrounded(this.position, this.capsuleRadius) : 
      this.position.y <= this.currentHeight / 2;
    
    // Handle slide decay
    if (this.isSliding) {
      this.slideTimer += dt;
      if (this.slideTimer >= this.maxSlideTime || !this.isGrounded) {
        this.isSliding = false;
        this.slideTimer = 0;
      }
    }
    
    // Update height smoothly
    const targetHeight = this.isCrouching ? this.crouchHeight : this.standHeight;
    this.currentHeight += (targetHeight - this.currentHeight) * dt * 10;
    
    // Apply friction
    const frictionFactor = this.isGrounded ? this.friction : this.airFriction;
    this.velocity.x *= Math.pow(1 - frictionFactor * 0.1, dt * 60);
    this.velocity.z *= Math.pow(1 - frictionFactor * 0.1, dt * 60);
    
    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    
    // Clamp position to ground
    if (this.isGrounded && this.position.y < this.currentHeight / 2) {
      this.position.y = this.currentHeight / 2;
      this.velocity.y = 0;
    }
  }
  
  _updateMovementState(input) {
    // Sprint
    this.isSprinting = input.sprint && !this.isCrouching && this.isGrounded;
    
    // Crouch
    if (input.crouch && this.isGrounded && !this.isSliding) {
      if (!this.isCrouching && this.isSprinting && this._hasMovementInput(input)) {
        // Initiate slide
        this.isSliding = true;
        this.slideTimer = 0;
      }
      this.isCrouching = true;
    } else if (!input.crouch) {
      this.isCrouching = false;
      this.isSliding = false;
    }
    
    // Jump
    if (input.jump && this.isGrounded && this.canJump && !this.isSliding) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.canJump = false;
      window.dispatchEvent(new CustomEvent('player:jump'));
    }
    
    if (!input.jump) {
      this.canJump = true;
    }
  }
  
  _applyMovement(input, dt) {
    const moveVector = input.move;
    if (!moveVector || (moveVector.x === 0 && moveVector.z === 0)) return;
    
    // Determine movement speed
    let speed = this.walkSpeed;
    if (this.isSliding) {
      speed = this.slideSpeed;
      // Decay slide speed
      this.velocity.x *= this.slideDecay;
      this.velocity.z *= this.slideDecay;
      return; // Slide takes over movement
    } else if (this.isSprinting) {
      speed = this.sprintSpeed;
    } else if (this.isCrouching) {
      speed = this.crouchSpeed;
    }
    
    // Apply air control reduction
    if (!this.isGrounded) {
      speed *= this.airControlFactor;
    }
    
    // Transform move vector by camera rotation
    const forward = input.forward || { x: 0, z: -1 };
    const right = input.right || { x: 1, z: 0 };
    
    const targetVelX = (right.x * moveVector.x + forward.x * moveVector.z) * speed;
    const targetVelZ = (right.z * moveVector.x + forward.z * moveVector.z) * speed;
    
    // Smoothly accelerate towards target velocity
    const accel = this.acceleration * dt;
    this.velocity.x += (targetVelX - this.velocity.x) * accel;
    this.velocity.z += (targetVelZ - this.velocity.z) * accel;
  }
  
  _applyGravity(dt) {
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }
  }
  
  _hasMovementInput(input) {
    return input.move && (input.move.x !== 0 || input.move.z !== 0);
  }
  
  getState() {
    return {
      position: { ...this.position },
      velocity: { ...this.velocity },
      isGrounded: this.isGrounded,
      isSprinting: this.isSprinting,
      isCrouching: this.isCrouching,
      isSliding: this.isSliding,
      height: this.currentHeight
    };
  }
  
  setState(state) {
    this.position = { ...state.position };
    this.velocity = { ...state.velocity };
    this.isGrounded = state.isGrounded;
    this.isSprinting = state.isSprinting;
    this.isCrouching = state.isCrouching;
    this.isSliding = state.isSliding;
    this.currentHeight = state.height || this.standHeight;
  }
  
  getMovementMultiplier() {
    if (this.isSliding) return 0.5;
    if (this.isSprinting) return 0.85;
    if (this.isCrouching) return 0.7;
    if (!this.isGrounded) return 0.6;
    return 1.0;
  }
}
