/**
 * ImpactDecals.js - Bullet impact decal system with pooling
 * Creates bullet holes and impact marks on surfaces
 */
import * as THREE from 'three';

export class ImpactDecals {
  constructor(scene) {
    this.scene = scene;
    this.activeDecals = [];
    this.decalPool = [];
    this.maxPoolSize = 100;
    this.maxDecals = 200;
    this.decalLifetime = 30.0; // 30 seconds
    
    // Pre-generate decal texture
    this.decalTexture = this._createDecalTexture();
    
    console.log('ImpactDecals effect created');
  }
  
  /**
   * Create pre-generated decal texture
   * @private
   */
  _createDecalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw bullet hole
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some random details
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 8;
      const x = 16 + Math.cos(angle) * dist;
      const y = 16 + Math.sin(angle) * dist;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  /**
   * Create an impact decal
   */
  createDecal(position, normal, type = 'bullet') {
    // Remove oldest decal if at limit
    if (this.activeDecals.length >= this.maxDecals) {
      const oldest = this.activeDecals.shift();
      this._removeDecal(oldest);
    }
    
    // Get or create decal
    let decal = this.decalPool.pop();
    
    if (!decal) {
      decal = this._createDecalObject(type);
    }
    
    // Position and orient the decal
    decal.position.copy(position);
    
    // Offset slightly from surface to avoid z-fighting
    const offset = normal.clone().multiplyScalar(0.01);
    decal.position.add(offset);
    
    // Orient to surface normal
    decal.lookAt(position.clone().add(normal));
    
    // Random rotation for variation
    decal.rotateZ(Math.random() * Math.PI * 2);
    
    // Random scale variation
    const scaleVariation = 0.8 + Math.random() * 0.4;
    decal.scale.set(scaleVariation, scaleVariation, 1);
    
    // Set lifetime
    decal.userData.lifetime = 0;
    decal.userData.maxLifetime = this.decalLifetime;
    decal.visible = true;
    
    // Add to scene
    this.scene.add(decal);
    this.activeDecals.push(decal);
  }
  
  /**
   * Create a decal object using pre-generated texture
   * @private
   */
  _createDecalObject(type) {
    const size = type === 'bullet' ? 0.1 : 0.15;
    const geometry = new THREE.PlaneGeometry(size, size);
    
    const material = new THREE.MeshBasicMaterial({
      map: this.decalTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.MultiplyBlending
    });
    
    const decal = new THREE.Mesh(geometry, material);
    decal.name = `decal_${type}`;
    
    return decal;
  }
  
  /**
   * Update all active decals
   */
  update(deltaTime) {
    for (let i = this.activeDecals.length - 1; i >= 0; i--) {
      const decal = this.activeDecals[i];
      decal.userData.lifetime += deltaTime;
      
      // Fade out near end of lifetime
      const lifePercent = decal.userData.lifetime / decal.userData.maxLifetime;
      if (lifePercent > 0.8) {
        const fadePercent = (lifePercent - 0.8) / 0.2;
        decal.material.opacity = 0.8 * (1.0 - fadePercent);
      }
      
      // Remove when expired
      if (lifePercent >= 1.0) {
        this.activeDecals.splice(i, 1);
        this._removeDecal(decal);
      }
    }
  }
  
  /**
   * Remove a decal from the scene
   * @private
   */
  _removeDecal(decal) {
    this.scene.remove(decal);
    
    // Return to pool
    if (this.decalPool.length < this.maxPoolSize) {
      decal.visible = false;
      decal.material.opacity = 0.8; // Reset opacity
      this.decalPool.push(decal);
    } else {
      decal.geometry.dispose();
      decal.material.dispose();
      // Don't dispose shared texture
    }
  }
  
  /**
   * Clear all decals
   */
  clearAll() {
    this.activeDecals.forEach(decal => this._removeDecal(decal));
    this.activeDecals = [];
  }
  
  /**
   * Dispose of all resources
   */
  dispose() {
    // Dispose active decals
    this.activeDecals.forEach(decal => {
      this.scene.remove(decal);
      decal.geometry.dispose();
      decal.material.dispose();
      // Don't dispose map here - it's shared
    });
    
    // Dispose pooled decals
    this.decalPool.forEach(decal => {
      decal.geometry.dispose();
      decal.material.dispose();
      // Don't dispose map here - it's shared
    });
    
    // Dispose shared texture
    if (this.decalTexture) {
      this.decalTexture.dispose();
    }
    
    this.activeDecals = [];
    this.decalPool = [];
    
    console.log('ImpactDecals disposed');
  }
}
