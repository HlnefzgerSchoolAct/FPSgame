// Particle system for visual effects

class Particle {
    constructor(x, y, z, vx, vy, vz, color, lifetime) {
        this.position = { x, y, z };
        this.velocity = { x: vx, y: vy, z: vz };
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.size = 0.1;
        this.isDead = false;
    }
    
    update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Apply gravity
        this.velocity.y -= 9.8 * deltaTime;
        
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.isDead = true;
        }
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    emit(x, y, z, type) {
        const count = type === 'blood' ? 15 : 8;
        const color = type === 'blood' ? '#ff0000' : '#888888';
        
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = MathUtils.randomRange(2, 5);
            const vx = Math.cos(angle) * speed;
            const vy = MathUtils.randomRange(2, 6);
            const vz = Math.sin(angle) * speed;
            const lifetime = MathUtils.randomRange(0.3, 0.6);
            
            this.particles.push(new Particle(x, y, z, vx, vy, vz, color, lifetime));
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].isDead) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    clear() {
        this.particles = [];
    }
}
