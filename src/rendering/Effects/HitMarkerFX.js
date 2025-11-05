/**
 * HitMarkerFX.js - 3D hit marker effect for confirming hits
 * Creates visual feedback when hitting targets
 */
import * as THREE from 'three';

export class HitMarkerFX {
  constructor(scene) {
    this.scene = scene;
    this.activeMarkers = [];
    this.markerPool = [];
    this.maxPoolSize = 20;
    
    console.log('HitMarkerFX effect created');
  }
  
  /**
   * Create a hit marker at impact position
   */
  createMarker(position, isHeadshot = false) {
    // Get or create marker
    let marker = this.markerPool.pop();
    
    if (!marker) {
      marker = this._createMarkerObject();
    }
    
    // Position marker
    marker.position.copy(position);
    
    // Set color based on hit type
    const color = isHeadshot ? 0xff0000 : 0xffffff;
    marker.material.color.setHex(color);
    marker.material.opacity = 1.0;
    
    // Reset properties
    marker.userData.lifetime = 0;
    marker.userData.maxLifetime = 0.3;
    marker.userData.initialY = position.y;
    marker.visible = true;
    
    // Add to scene
    this.scene.add(marker);
    this.activeMarkers.push(marker);
  }
  
  /**
   * Create a marker mesh
   * @private
   */
  _createMarkerObject() {
    // Create X shape marker
    const group = new THREE.Group();
    
    const lineGeometry = new THREE.PlaneGeometry(0.15, 0.02);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    // First diagonal
    const line1 = new THREE.Mesh(lineGeometry, material.clone());
    line1.rotation.z = Math.PI / 4;
    group.add(line1);
    
    // Second diagonal
    const line2 = new THREE.Mesh(lineGeometry, material.clone());
    line2.rotation.z = -Math.PI / 4;
    group.add(line2);
    
    group.name = 'hit_marker';
    
    return group;
  }
  
  /**
   * Update all active markers
   */
  update(deltaTime, cameraPosition) {
    for (let i = this.activeMarkers.length - 1; i >= 0; i--) {
      const marker = this.activeMarkers[i];
      marker.userData.lifetime += deltaTime;
      
      // Fade and rise
      const lifePercent = marker.userData.lifetime / marker.userData.maxLifetime;
      marker.position.y = marker.userData.initialY + lifePercent * 0.5;
      
      // Fade out
      const opacity = 1.0 - lifePercent;
      marker.traverse(child => {
        if (child.material) {
          child.material.opacity = opacity;
        }
      });
      
      // Billboard to camera
      if (cameraPosition) {
        marker.lookAt(cameraPosition);
      }
      
      // Remove when expired
      if (lifePercent >= 1.0) {
        this.scene.remove(marker);
        this.activeMarkers.splice(i, 1);
        
        // Return to pool
        if (this.markerPool.length < this.maxPoolSize) {
          marker.visible = false;
          this.markerPool.push(marker);
        } else {
          marker.traverse(child => {
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
    // Dispose active markers
    this.activeMarkers.forEach(marker => {
      this.scene.remove(marker);
      marker.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    
    // Dispose pooled markers
    this.markerPool.forEach(marker => {
      marker.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    
    this.activeMarkers = [];
    this.markerPool = [];
    
    console.log('HitMarkerFX disposed');
  }
}
