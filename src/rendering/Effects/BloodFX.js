/**
 * BloodFX.js - Blood splatter effects for hit feedback
 */
import * as THREE from 'three';

export class BloodFX {
  constructor(scene) {
    this.scene = scene;
    this.activeParticles = [];
    console.log('BloodFX effect created');
  }
  
  createBloodSplatter(position, direction) {
    // Simple particle-based blood effect
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.02, 4, 4);
      const material = new THREE.MeshBasicMaterial({ color: 0x8b0000 });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.copy(position);
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      particle.userData.lifetime = 0;
      particle.userData.maxLifetime = 1.0;
      
      this.scene.add(particle);
      this.activeParticles.push(particle);
    }
  }
  
  update(deltaTime) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      particle.userData.lifetime += deltaTime;
      
      // Apply velocity
      particle.position.add(particle.userData.velocity.clone().multiplyScalar(deltaTime));
      particle.userData.velocity.y -= 9.8 * deltaTime; // Gravity
      
      // Fade out
      const lifePercent = particle.userData.lifetime / particle.userData.maxLifetime;
      particle.material.opacity = 1.0 - lifePercent;
      
      if (lifePercent >= 1.0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.activeParticles.splice(i, 1);
      }
    }
  }
  
  dispose() {
    this.activeParticles.forEach(p => {
      this.scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
    });
    this.activeParticles = [];
  }
}
