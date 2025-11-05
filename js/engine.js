// Game Engine with Raycasting Renderer

class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Game systems
        this.level = null;
        this.player = null;
        this.weaponManager = null;
        this.enemyManager = null;
        this.particleSystem = null;
        this.audio = null;
        this.ui = null;
        this.gameState = null;
        
        // Rendering
        this.fov = Math.PI / 3; // 60 degrees
        this.renderDistance = 20;
        this.numRays = 120; // Number of vertical strips to render
    }
    
    init() {
        // Setup canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        // Initialize systems
        this.level = new Level();
        this.player = new Player(2, 0.6, 2);
        this.player.init(this.canvas);
        this.weaponManager = new WeaponManager();
        this.enemyManager = new EnemyManager();
        this.enemyManager.init(this.level);
        this.particleSystem = new ParticleSystem();
        this.audio = new AudioManager();
        this.audio.init();
        this.ui = new UIManager();
        this.ui.init();
        this.gameState = new GameState();
        
        // Input handling
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Show main menu
        this.ui.showMenu('main');
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    handleKeyDown(e) {
        if (e.code === 'Escape' && this.gameState.state === 'playing') {
            this.pauseGame();
        }
        
        if (e.code === 'KeyR' && this.gameState.state === 'playing') {
            const weapon = this.weaponManager.getCurrentWeapon();
            if (weapon.reload()) {
                this.audio.playReload();
            }
        }
        
        // Weapon switching
        if (this.gameState.state === 'playing') {
            if (e.code === 'Digit1') this.weaponManager.switchWeapon(0);
            if (e.code === 'Digit2') this.weaponManager.switchWeapon(1);
            if (e.code === 'Digit3') this.weaponManager.switchWeapon(2);
        }
    }
    
    handleMouseDown(e) {
        if (this.gameState.state !== 'playing') return;
        
        if (e.button === 0) { // Left click - shoot
            this.shoot();
        }
    }
    
    shoot() {
        const weapon = this.weaponManager.getCurrentWeapon();
        const currentTime = performance.now() / 1000;
        
        if (weapon.shoot(currentTime)) {
            this.audio.playShoot();
            
            // Screen shake
            this.screenShake = weapon.recoil;
            
            const direction = this.player.getDirection();
            const origin = {
                x: this.player.position.x,
                y: this.player.position.y + this.player.eyeHeight,
                z: this.player.position.z
            };
            
            let hitEnemy = false;
            
            // Shoot multiple projectiles for shotgun
            for (let i = 0; i < weapon.projectilesPerShot; i++) {
                // Apply spread
                const spreadX = (Math.random() - 0.5) * weapon.spread;
                const spreadY = (Math.random() - 0.5) * weapon.spread;
                
                const spreadDir = {
                    x: direction.x + spreadX,
                    y: direction.y + spreadY,
                    z: direction.z + spreadX
                };
                
                // Check hit on enemies
                const activeEnemies = this.enemyManager.getActiveEnemies();
                for (const enemy of activeEnemies) {
                    const distToEnemy = Vector.distance(this.player.position, enemy.position);
                    if (distToEnemy < this.renderDistance) {
                        // Simple hit detection - check if enemy is in front and in spread cone
                        const dirToEnemy = Vector.normalize(Vector.subtract(enemy.position, this.player.position));
                        const dotProduct = Vector.dot(spreadDir, dirToEnemy);
                        
                        if (dotProduct > 0.95 && distToEnemy < 15) {
                            if (enemy.takeDamage(weapon.damage)) {
                                this.gameState.addKill();
                                this.audio.playEnemyDeath();
                                this.particleSystem.emit(enemy.position.x, enemy.position.y + 0.5, enemy.position.z, 'blood');
                                this.enemyManager.waveMultiplier = 1 + this.gameState.wave * 0.1;
                            } else {
                                this.audio.playHit();
                                this.particleSystem.emit(enemy.position.x, enemy.position.y + 0.5, enemy.position.z, 'blood');
                            }
                            hitEnemy = true;
                            break;
                        }
                    }
                }
                
                // Check hit on walls
                if (!hitEnemy) {
                    const wallHit = this.level.raycastHit(
                        origin.x, origin.y, origin.z,
                        spreadDir.x, spreadDir.y, spreadDir.z,
                        this.renderDistance
                    );
                    
                    if (wallHit.hit) {
                        this.particleSystem.emit(wallHit.point.x, wallHit.point.y, wallHit.point.z, 'impact');
                    }
                }
            }
            
            if (hitEnemy) {
                this.ui.showHitmarker();
                this.gameState.recordShot(true);
            } else {
                this.gameState.recordShot(false);
            }
        }
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Cap delta time to prevent huge jumps
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        this.update(this.deltaTime);
        this.render();
        
        Performance.update();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        if (this.gameState.state === 'playing') {
            this.player.update(deltaTime, this.level);
            this.weaponManager.update(deltaTime);
            this.enemyManager.update(deltaTime, this.player, this.level, performance.now() / 1000);
            this.particleSystem.update(deltaTime);
            this.gameState.update(deltaTime);
            
            // Check for player death
            if (!this.player.isAlive && this.gameState.state === 'playing') {
                this.gameOver();
            }
            
            // Update UI
            this.ui.updateHUD(this.player, this.weaponManager, this.gameState);
            
            // Show damage indicator
            const lastHealth = this.player.health;
            if (lastHealth < this.player.health) {
                this.ui.showDamage();
                this.audio.playDamage();
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.gameState.state === 'playing') {
            this.renderWorld();
            this.renderEnemies();
        }
    }
    
    renderWorld() {
        const rayAngleStep = this.fov / this.numRays;
        const stripWidth = this.width / this.numRays;
        
        for (let i = 0; i < this.numRays; i++) {
            const rayAngle = this.player.rotation.yaw - this.fov / 2 + rayAngleStep * i;
            
            const result = this.level.castRay(
                this.player.position.x,
                this.player.position.z,
                rayAngle,
                this.renderDistance
            );
            
            if (result.hit) {
                // Correct fish-eye effect
                const correctedDistance = result.distance * Math.cos(rayAngle - this.player.rotation.yaw);
                
                const wallHeight = (this.level.wallHeight / correctedDistance) * (this.width / 2);
                const wallTop = (this.height / 2) - wallHeight / 2;
                const wallBottom = wallTop + wallHeight;
                
                // Draw ceiling
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(i * stripWidth, 0, stripWidth, wallTop);
                
                // Draw wall with shading based on distance and side
                let brightness = Math.max(0, 1 - correctedDistance / this.renderDistance);
                if (result.side === 1) brightness *= 0.7; // Darken one side
                
                const colorValue = Math.floor(brightness * 200);
                this.ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                this.ctx.fillRect(i * stripWidth, wallTop, stripWidth, wallHeight);
                
                // Draw floor
                this.ctx.fillStyle = '#16213e';
                this.ctx.fillRect(i * stripWidth, wallBottom, stripWidth, this.height - wallBottom);
            } else {
                // Draw sky/ceiling
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(i * stripWidth, 0, stripWidth, this.height / 2);
                
                // Draw floor
                this.ctx.fillStyle = '#16213e';
                this.ctx.fillRect(i * stripWidth, this.height / 2, stripWidth, this.height / 2);
            }
        }
    }
    
    renderEnemies() {
        const activeEnemies = this.enemyManager.getActiveEnemies();
        
        for (const enemy of activeEnemies) {
            const dx = enemy.position.x - this.player.position.x;
            const dz = enemy.position.z - this.player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance > this.renderDistance) continue;
            
            // Calculate angle to enemy
            const angleToEnemy = Math.atan2(dz, dx);
            let angleDiff = angleToEnemy - this.player.rotation.yaw;
            
            // Normalize angle
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Check if enemy is in view
            if (Math.abs(angleDiff) < this.fov / 2 + 0.5) {
                const enemySize = 0.5;
                const screenX = (angleDiff / this.fov + 0.5) * this.width;
                const spriteHeight = (enemySize / distance) * (this.width / 2);
                const spriteWidth = spriteHeight;
                
                const spriteTop = this.height / 2 - spriteHeight / 2;
                
                // Draw enemy as simple rectangle
                let brightness = Math.max(0, 1 - distance / this.renderDistance);
                
                // Enemy color based on state
                let color = `rgba(255, 0, 0, ${brightness})`;
                if (enemy.state === 'attack') {
                    color = `rgba(255, 100, 0, ${brightness})`;
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    screenX - spriteWidth / 2,
                    spriteTop,
                    spriteWidth,
                    spriteHeight
                );
                
                // Draw health bar above enemy
                if (enemy.health < enemy.maxHealth) {
                    const barWidth = spriteWidth;
                    const barHeight = 4;
                    const barX = screenX - barWidth / 2;
                    const barY = spriteTop - 10;
                    
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.fillRect(barX, barY, barWidth, barHeight);
                    
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                    const healthWidth = (enemy.health / enemy.maxHealth) * barWidth;
                    this.ctx.fillRect(barX, barY, healthWidth, barHeight);
                }
            }
        }
    }
    
    startGame() {
        this.gameState.reset();
        this.player = new Player(2, 0.6, 2);
        this.player.init(this.canvas);
        this.weaponManager = new WeaponManager();
        this.enemyManager.clear();
        this.enemyManager.waveMultiplier = 1;
        this.particleSystem.clear();
        this.gameState.state = 'playing';
        this.ui.hideAllMenus();
    }
    
    pauseGame() {
        if (this.gameState.state === 'playing') {
            this.gameState.state = 'paused';
            this.ui.showMenu('pause');
        }
    }
    
    resumeGame() {
        if (this.gameState.state === 'paused') {
            this.gameState.state = 'playing';
            this.ui.hideAllMenus();
        }
    }
    
    gameOver() {
        this.gameState.state = 'gameover';
        this.ui.showGameOver(this.gameState.getFinalStats());
    }
    
    restartGame() {
        this.startGame();
    }
    
    quitToMenu() {
        this.gameState.state = 'menu';
        this.ui.showMenu('main');
    }
}
