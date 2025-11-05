// Enemy AI system

class Enemy {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = 0;
        
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 10;
        this.moveSpeed = 1.5;
        this.detectionRange = 12;
        this.attackRange = 10;
        this.fireRate = 0.5; // Shots per second
        this.lastShotTime = 0;
        
        this.state = 'idle';
        this.isDead = false;
        this.deathTime = 0;
        this.radius = 0.3;
        
        this.updateInterval = 0.1; // Update AI every 100ms
        this.updateTimer = 0;
    }
    
    update(deltaTime, player, level, currentTime) {
        if (this.isDead) {
            this.deathTime += deltaTime;
            return;
        }
        
        this.updateTimer += deltaTime;
        if (this.updateTimer >= this.updateInterval) {
            this.updateAI(player, level, currentTime);
            this.updateTimer = 0;
        }
        
        // Apply movement
        const newX = this.position.x + this.velocity.x * deltaTime;
        const newZ = this.position.z + this.velocity.z * deltaTime;
        
        if (!level.checkCollision(newX, this.position.z, this.radius)) {
            this.position.x = newX;
        }
        
        if (!level.checkCollision(this.position.x, newZ, this.radius)) {
            this.position.z = newZ;
        }
    }
    
    updateAI(player, level, currentTime) {
        const distanceToPlayer = Vector.distance2D(this.position, player.position);
        
        // Look at player
        const dx = player.position.x - this.position.x;
        const dz = player.position.z - this.position.z;
        this.rotation = Math.atan2(dz, dx);
        
        if (distanceToPlayer < this.detectionRange) {
            if (distanceToPlayer < this.attackRange) {
                // Attack state
                this.state = 'attack';
                this.velocity.x = 0;
                this.velocity.z = 0;
                
                if (currentTime - this.lastShotTime >= 1 / this.fireRate) {
                    this.shootAtPlayer(player);
                    this.lastShotTime = currentTime;
                }
            } else {
                // Chase state
                this.state = 'chase';
                const direction = Vector.normalize({ x: dx, y: 0, z: dz });
                this.velocity.x = direction.x * this.moveSpeed;
                this.velocity.z = direction.z * this.moveSpeed;
            }
        } else {
            // Idle state
            this.state = 'idle';
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
    }
    
    shootAtPlayer(player) {
        // Simple hit chance calculation
        const distance = Vector.distance2D(this.position, player.position);
        const accuracy = 0.3 - (distance / this.attackRange) * 0.2;
        
        if (Math.random() < accuracy) {
            player.takeDamage(this.damage);
            return true;
        }
        return false;
    }
    
    takeDamage(amount) {
        if (this.isDead) return false;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            return true; // Killed
        }
        return false;
    }
    
    die() {
        this.isDead = true;
        this.state = 'dead';
        this.deathTime = 0;
    }
}

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.maxEnemies = 10;
        this.spawnPoints = [];
        this.spawnRate = 5;
        this.lastSpawnTime = 0;
        this.enemiesPerWave = 5;
        this.waveMultiplier = 1;
    }
    
    init(level) {
        this.spawnPoints = level.spawnPoints;
    }
    
    update(deltaTime, player, level, currentTime) {
        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player, level, currentTime);
            
            // Remove dead enemies after delay
            if (enemy.isDead && enemy.deathTime > 3) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Spawn new enemies
        if (this.getActiveCount() < this.maxEnemies && 
            currentTime - this.lastSpawnTime >= this.spawnRate) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
        }
    }
    
    spawnEnemy() {
        if (this.spawnPoints.length === 0) return;
        
        const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        const enemy = new Enemy(spawnPoint.x, 0.5, spawnPoint.z);
        enemy.health *= this.waveMultiplier;
        enemy.maxHealth *= this.waveMultiplier;
        enemy.damage *= this.waveMultiplier;
        this.enemies.push(enemy);
    }
    
    getActiveEnemies() {
        return this.enemies.filter(e => !e.isDead);
    }
    
    getActiveCount() {
        return this.getActiveEnemies().length;
    }
    
    clear() {
        this.enemies = [];
    }
}
