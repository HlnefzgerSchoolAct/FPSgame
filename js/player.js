// Player class with movement and controls

class Player {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { pitch: 0, yaw: 0 };
        
        this.height = 0.6;
        this.normalHeight = 0.6;
        this.crouchHeight = 0.3;
        this.eyeHeight = 0.5;
        
        this.moveSpeed = 3;
        this.sprintMultiplier = 1.7;
        this.crouchMultiplier = 0.5;
        this.jumpForce = 5;
        this.gravity = 15;
        
        this.isCrouching = false;
        this.isSprinting = false;
        this.isGrounded = true;
        this.canJump = true;
        
        this.health = 100;
        this.maxHealth = 100;
        this.isAlive = true;
        
        this.radius = 0.3;
        
        // Input state
        this.keys = {};
        this.mouseSensitivity = 0.002;
        this.mouseMovement = { x: 0, y: 0 };
        this.isPointerLocked = false;
    }
    
    init(canvas) {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouseMovement.x += e.movementX;
                this.mouseMovement.y += e.movementY;
            }
        });
    }
    
    update(deltaTime, level) {
        if (!this.isAlive) return;
        
        this.handleMouseLook();
        this.handleMovement(deltaTime, level);
        this.applyGravity(deltaTime, level);
        this.handleCrouch();
    }
    
    handleMouseLook() {
        if (!this.isPointerLocked) return;
        
        this.rotation.yaw -= this.mouseMovement.x * this.mouseSensitivity;
        this.rotation.pitch -= this.mouseMovement.y * this.mouseSensitivity;
        
        // Clamp pitch
        this.rotation.pitch = MathUtils.clamp(this.rotation.pitch, -Math.PI / 2, Math.PI / 2);
        
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
    }
    
    handleMovement(deltaTime, level) {
        let moveX = 0;
        let moveZ = 0;
        
        // WASD movement
        if (this.keys['KeyW']) moveZ += 1;
        if (this.keys['KeyS']) moveZ -= 1;
        if (this.keys['KeyA']) moveX -= 1;
        if (this.keys['KeyD']) moveX += 1;
        
        if (moveX !== 0 || moveZ !== 0) {
            // Normalize diagonal movement
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= length;
            moveZ /= length;
            
            // Calculate movement direction based on camera rotation
            const cos = Math.cos(this.rotation.yaw);
            const sin = Math.sin(this.rotation.yaw);
            
            const worldMoveX = moveX * cos - moveZ * sin;
            const worldMoveZ = moveX * sin + moveZ * cos;
            
            // Apply speed modifiers
            let speed = this.moveSpeed;
            this.isSprinting = this.keys['ShiftLeft'] && moveZ > 0;
            if (this.isSprinting) speed *= this.sprintMultiplier;
            if (this.isCrouching) speed *= this.crouchMultiplier;
            
            this.velocity.x = worldMoveX * speed;
            this.velocity.z = worldMoveZ * speed;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
        
        // Apply movement with collision detection
        const newX = this.position.x + this.velocity.x * deltaTime;
        const newZ = this.position.z + this.velocity.z * deltaTime;
        
        if (!level.checkCollision(newX, this.position.z, this.radius)) {
            this.position.x = newX;
        }
        
        if (!level.checkCollision(this.position.x, newZ, this.radius)) {
            this.position.z = newZ;
        }
        
        // Jump
        if (this.keys['Space'] && this.isGrounded && this.canJump) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.canJump = false;
        }
        
        if (!this.keys['Space']) {
            this.canJump = true;
        }
    }
    
    applyGravity(deltaTime, level) {
        this.velocity.y -= this.gravity * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Ground collision
        if (this.position.y <= this.height) {
            this.position.y = this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }
    
    handleCrouch() {
        this.isCrouching = this.keys['ControlLeft'];
        const targetHeight = this.isCrouching ? this.crouchHeight : this.normalHeight;
        this.height = MathUtils.lerp(this.height, targetHeight, 0.1);
    }
    
    getDirection() {
        return {
            x: Math.cos(this.rotation.pitch) * Math.cos(this.rotation.yaw),
            y: Math.sin(this.rotation.pitch),
            z: Math.cos(this.rotation.pitch) * Math.sin(this.rotation.yaw)
        };
    }
    
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}
