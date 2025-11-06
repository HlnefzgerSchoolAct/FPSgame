/**
 * ProjectilePool.js - Pool for bullet/projectile objects
 */
import { ObjectPool } from './ObjectPool.js';
import * as THREE from 'three';

export class ProjectilePool extends ObjectPool {
  constructor(scene, initialSize = 50, maxSize = 500) {
    const factory = () => {
      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      
      // Projectile data
      mesh.userData = {
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        lifetime: 0,
        maxLifetime: 5.0,
        damage: 0,
        ownerId: null,
        weaponId: null
      };
      
      return mesh;
    };
    
    const reset = (projectile) => {
      projectile.visible = false;
      projectile.userData.active = false;
      projectile.userData.lifetime = 0;
      projectile.userData.velocity.set(0, 0, 0);
      projectile.userData.position.set(0, 0, 0);
      projectile.userData.damage = 0;
      projectile.userData.ownerId = null;
      projectile.userData.weaponId = null;
      
      // Remove from scene if added
      if (projectile.parent) {
        projectile.parent.remove(projectile);
      }
    };
    
    super(factory, reset, initialSize, maxSize);
    this.scene = scene;
  }
  
  /**
   * Spawn a projectile with initial parameters
   */
  spawn(position, direction, speed, damage, ownerId, weaponId) {
    const projectile = this.acquire();
    
    projectile.position.copy(position);
    projectile.userData.position.copy(position);
    projectile.userData.velocity.copy(direction).multiplyScalar(speed);
    projectile.userData.damage = damage;
    projectile.userData.ownerId = ownerId;
    projectile.userData.weaponId = weaponId;
    projectile.userData.active = true;
    projectile.userData.lifetime = 0;
    projectile.visible = true;
    
    this.scene.add(projectile);
    
    return projectile;
  }
  
  /**
   * Update all active projectiles
   */
  update(deltaTime) {
    const toRelease = [];
    
    this.inUse.forEach(projectile => {
      if (!projectile.userData.active) return;
      
      // Update lifetime
      projectile.userData.lifetime += deltaTime;
      
      // Check if expired
      if (projectile.userData.lifetime >= projectile.userData.maxLifetime) {
        toRelease.push(projectile);
        return;
      }
      
      // Update position
      projectile.userData.position.addScaledVector(projectile.userData.velocity, deltaTime);
      projectile.position.copy(projectile.userData.position);
    });
    
    // Release expired projectiles
    toRelease.forEach(projectile => this.release(projectile));
  }
  
  /**
   * Dispose of all geometry and materials
   */
  dispose() {
    this.inUse.forEach(projectile => {
      if (projectile.geometry) projectile.geometry.dispose();
      if (projectile.material) projectile.material.dispose();
    });
    
    this.available.forEach(projectile => {
      if (projectile.geometry) projectile.geometry.dispose();
      if (projectile.material) projectile.material.dispose();
    });
    
    this.clear();
  }
}
