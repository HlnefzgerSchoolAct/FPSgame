/**
 * DecalPool.js - Pool for bullet impact decals
 */
import { ObjectPool } from './ObjectPool.js';
import * as THREE from 'three';

export class DecalPool extends ObjectPool {
  constructor(scene, initialSize = 100, maxSize = 500) {
    const factory = () => {
      // Simple quad for decal
      const geometry = new THREE.PlaneGeometry(0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      
      mesh.userData = {
        active: false,
        lifetime: 0,
        maxLifetime: 10.0, // Decals fade after 10 seconds
        fadeStartTime: 8.0 // Start fading at 8 seconds
      };
      
      return mesh;
    };
    
    const reset = (decal) => {
      decal.visible = false;
      decal.userData.active = false;
      decal.userData.lifetime = 0;
      decal.material.opacity = 0.8;
      
      if (decal.parent) {
        decal.parent.remove(decal);
      }
    };
    
    super(factory, reset, initialSize, maxSize);
    this.scene = scene;
  }
  
  /**
   * Spawn a decal at a hit position
   */
  spawn(position, normal) {
    const decal = this.acquire();
    
    decal.position.copy(position);
    
    // Offset slightly along normal to prevent z-fighting
    decal.position.addScaledVector(normal, 0.01);
    
    // Orient to surface normal
    decal.lookAt(position.clone().add(normal));
    
    decal.userData.active = true;
    decal.userData.lifetime = 0;
    decal.material.opacity = 0.8;
    decal.visible = true;
    
    this.scene.add(decal);
    
    return decal;
  }
  
  /**
   * Update all active decals (fade over time)
   */
  update(deltaTime) {
    const toRelease = [];
    
    this.inUse.forEach(decal => {
      if (!decal.userData.active) return;
      
      decal.userData.lifetime += deltaTime;
      
      // Check if expired
      if (decal.userData.lifetime >= decal.userData.maxLifetime) {
        toRelease.push(decal);
        return;
      }
      
      // Fade out
      if (decal.userData.lifetime >= decal.userData.fadeStartTime) {
        const fadeProgress = (decal.userData.lifetime - decal.userData.fadeStartTime) / 
                           (decal.userData.maxLifetime - decal.userData.fadeStartTime);
        decal.material.opacity = 0.8 * (1.0 - fadeProgress);
      }
    });
    
    // Release expired decals
    toRelease.forEach(decal => this.release(decal));
  }
  
  /**
   * Dispose of all geometry and materials
   */
  dispose() {
    this.inUse.forEach(decal => {
      if (decal.geometry) decal.geometry.dispose();
      if (decal.material) decal.material.dispose();
    });
    
    this.available.forEach(decal => {
      if (decal.geometry) decal.geometry.dispose();
      if (decal.material) decal.material.dispose();
    });
    
    this.clear();
  }
}
