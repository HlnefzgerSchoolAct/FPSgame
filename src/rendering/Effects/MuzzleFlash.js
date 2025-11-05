/**
 * MuzzleFlash.js - Muzzle flash effect for weapon firing
 * Creates a brief flash effect at the weapon muzzle with particle emission
 */
import * as THREE from 'three';

export class MuzzleFlash {
  constructor(scene) {
    this.scene = scene;
    this.activeMuzzleFlashes = [];
    this.flashPool = [];
    this.maxPoolSize = 10;
    
    console.log('MuzzleFlash effect created');
  }
  
  /**
   * Create a muzzle flash at the specified position
   */
  createFlash(position, direction, weaponType = 'default') {
    // Get or create flash object
    let flash = this.flashPool.pop();
    
    if (!flash) {
      flash = this._createFlashObject();
    }
    
    // Position and orient the flash
    flash.position.copy(position);
    flash.lookAt(position.clone().add(direction));
    
    // Scale based on weapon type
    const scale = this._getScaleForWeapon(weaponType);
    flash.scale.set(scale, scale, scale);
    
    // Reset flash properties
    flash.userData.lifetime = 0;
    flash.userData.maxLifetime = 0.05; // 50ms flash duration
    flash.visible = true;
    
    // Add to scene
    this.scene.add(flash);
    this.activeMuzzleFlashes.push(flash);
  }
  
  /**
   * Create a flash mesh object
   * @private
   */
  _createFlashObject() {
    const group = new THREE.Group();
    
    // Main flash sprite
    const flashGeometry = new THREE.PlaneGeometry(0.3, 0.3);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const flashMesh = new THREE.Mesh(flashGeometry, flashMaterial);
    flashMesh.name = 'flash_main';
    group.add(flashMesh);
    
    // Secondary flash for depth
    const flash2Geometry = new THREE.PlaneGeometry(0.2, 0.2);
    const flash2Material = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const flash2Mesh = new THREE.Mesh(flash2Geometry, flash2Material);
    flash2Mesh.position.z = 0.05;
    flash2Mesh.rotation.z = Math.PI / 4; // Rotate 45 degrees
    flash2Mesh.name = 'flash_secondary';
    group.add(flash2Mesh);
    
    // Point light for illumination
    const light = new THREE.PointLight(0xffaa00, 2, 5);
    light.name = 'flash_light';
    group.add(light);
    
    group.name = 'muzzle_flash';
    
    return group;
  }
  
  /**
   * Get scale multiplier for weapon type
   * @private
   */
  _getScaleForWeapon(weaponType) {
    const scales = {
      pistol: 0.5,
      smg: 0.7,
      rifle: 1.0,
      sniper: 1.2,
      shotgun: 1.5,
      default: 1.0
    };
    
    return scales[weaponType] || scales.default;
  }
  
  /**
   * Update all active muzzle flashes
   */
  update(deltaTime) {
    for (let i = this.activeMuzzleFlashes.length - 1; i >= 0; i--) {
      const flash = this.activeMuzzleFlashes[i];
      flash.userData.lifetime += deltaTime;
      
      // Calculate fade based on lifetime
      const lifePercent = flash.userData.lifetime / flash.userData.maxLifetime;
      const opacity = 1.0 - lifePercent;
      
      // Update opacity of all meshes
      flash.traverse((child) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = opacity;
        }
        if (child.isLight) {
          child.intensity = 2 * opacity;
        }
      });
      
      // Random rotation for variation
      flash.rotation.z += deltaTime * 10;
      
      // Remove when expired
      if (lifePercent >= 1.0) {
        this.scene.remove(flash);
        this.activeMuzzleFlashes.splice(i, 1);
        
        // Return to pool if pool not full
        if (this.flashPool.length < this.maxPoolSize) {
          flash.visible = false;
          this.flashPool.push(flash);
        } else {
          // Dispose if pool is full
          flash.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        }
      }
    }
  }
  
  /**
   * Dispose of all resources
   */
  dispose() {
    // Dispose active flashes
    this.activeMuzzleFlashes.forEach(flash => {
      this.scene.remove(flash);
      flash.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    
    // Dispose pooled flashes
    this.flashPool.forEach(flash => {
      flash.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    
    this.activeMuzzleFlashes = [];
    this.flashPool = [];
    
    console.log('MuzzleFlash disposed');
  }
}
