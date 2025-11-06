/**
 * ParticlePool.js - Pool for particle effects
 */
import { ObjectPool } from './ObjectPool.js';
import * as THREE from 'three';

export class ParticlePool extends ObjectPool {
  constructor(scene, initialSize = 200, maxSize = 2000) {
    const factory = () => {
      // Simple sprite-based particle
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([0, 0, 0]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const particle = new THREE.Points(geometry, material);
      particle.visible = false;
      
      particle.userData = {
        active: false,
        velocity: new THREE.Vector3(),
        lifetime: 0,
        maxLifetime: 1.0,
        startSize: 0.1,
        endSize: 0.05,
        startOpacity: 1.0,
        endOpacity: 0.0,
        gravity: -9.8
      };
      
      return particle;
    };
    
    const reset = (particle) => {
      particle.visible = false;
      particle.userData.active = false;
      particle.userData.lifetime = 0;
      particle.userData.velocity.set(0, 0, 0);
      particle.material.opacity = 1.0;
      particle.material.size = particle.userData.startSize;
      
      if (particle.parent) {
        particle.parent.remove(particle);
      }
    };
    
    super(factory, reset, initialSize, maxSize);
    this.scene = scene;
  }
  
  /**
   * Spawn a particle
   */
  spawn(position, velocity, options = {}) {
    const particle = this.acquire();
    
    particle.position.copy(position);
    particle.userData.velocity.copy(velocity);
    particle.userData.lifetime = 0;
    particle.userData.maxLifetime = options.lifetime || 1.0;
    particle.userData.startSize = options.startSize || 0.1;
    particle.userData.endSize = options.endSize || 0.05;
    particle.userData.startOpacity = options.startOpacity || 1.0;
    particle.userData.endOpacity = options.endOpacity || 0.0;
    particle.userData.gravity = options.gravity !== undefined ? options.gravity : -9.8;
    
    if (options.color) {
      particle.material.color.setHex(options.color);
    }
    
    particle.material.size = particle.userData.startSize;
    particle.material.opacity = particle.userData.startOpacity;
    particle.userData.active = true;
    particle.visible = true;
    
    this.scene.add(particle);
    
    return particle;
  }
  
  /**
   * Update all active particles
   */
  update(deltaTime) {
    const toRelease = [];
    
    this.inUse.forEach(particle => {
      if (!particle.userData.active) return;
      
      particle.userData.lifetime += deltaTime;
      
      // Check if expired
      if (particle.userData.lifetime >= particle.userData.maxLifetime) {
        toRelease.push(particle);
        return;
      }
      
      // Update velocity (gravity)
      particle.userData.velocity.y += particle.userData.gravity * deltaTime;
      
      // Update position
      particle.position.addScaledVector(particle.userData.velocity, deltaTime);
      
      // Update size and opacity
      const t = particle.userData.lifetime / particle.userData.maxLifetime;
      particle.material.size = THREE.MathUtils.lerp(
        particle.userData.startSize,
        particle.userData.endSize,
        t
      );
      particle.material.opacity = THREE.MathUtils.lerp(
        particle.userData.startOpacity,
        particle.userData.endOpacity,
        t
      );
    });
    
    // Release expired particles
    toRelease.forEach(particle => this.release(particle));
  }
  
  /**
   * Emit a burst of particles
   */
  emitBurst(position, count, options = {}) {
    const particles = [];
    
    // Reuse velocity vector to avoid allocations
    if (!this._tempVelocity) {
      this._tempVelocity = new THREE.Vector3();
    }
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = options.speed || 2.0;
      const spread = options.spread || 0.5;
      
      this._tempVelocity.set(
        Math.cos(angle) * speed + (Math.random() - 0.5) * spread,
        Math.random() * speed,
        Math.sin(angle) * speed + (Math.random() - 0.5) * spread
      );
      
      particles.push(this.spawn(position, this._tempVelocity, options));
    }
    
    return particles;
  }
  
  /**
   * Dispose of all geometry and materials
   */
  dispose() {
    this.inUse.forEach(particle => {
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });
    
    this.available.forEach(particle => {
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });
    
    this.clear();
  }
}
