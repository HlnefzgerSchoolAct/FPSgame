/**
 * BulletTracer.js - Bullet tracer visualization
 * Creates visible bullet trails for weapon fire feedback
 */
import * as THREE from 'three';

export class BulletTracer {
  constructor(scene) {
    this.scene = scene;
    this.activeTracers = [];
    this.tracerPool = [];
    this.maxPoolSize = 50;
    
    console.log('BulletTracer effect created');
  }
  
  /**
   * Create a bullet tracer
   */
  createTracer(start, end, color = 0xffaa00, duration = 0.1) {
    // Get or create tracer
    let tracer = this.tracerPool.pop();
    
    if (!tracer) {
      tracer = this._createTracerObject();
    }
    
    // Calculate direction and distance
    const direction = new THREE.Vector3().subVectors(end, start);
    const distance = direction.length();
    direction.normalize();
    
    // Position the tracer
    tracer.position.copy(start);
    tracer.lookAt(end);
    
    // Scale to match distance
    tracer.scale.set(1, 1, distance);
    
    // Set color
    tracer.material.color.setHex(color);
    tracer.material.opacity = 1.0;
    
    // Set lifetime
    tracer.userData.lifetime = 0;
    tracer.userData.maxLifetime = duration;
    tracer.visible = true;
    
    // Add to scene
    this.scene.add(tracer);
    this.activeTracers.push(tracer);
  }
  
  /**
   * Create a tracer line object
   * @private
   */
  _createTracerObject() {
    const geometry = new THREE.CylinderGeometry(0.005, 0.005, 1, 4);
    // Rotate to align with Z axis (default is Y axis)
    geometry.rotateX(Math.PI / 2);
    // Move origin to start of cylinder
    geometry.translate(0, 0, 0.5);
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const tracer = new THREE.Mesh(geometry, material);
    tracer.name = 'bullet_tracer';
    
    return tracer;
  }
  
  /**
   * Update all active tracers
   */
  update(deltaTime) {
    for (let i = this.activeTracers.length - 1; i >= 0; i--) {
      const tracer = this.activeTracers[i];
      tracer.userData.lifetime += deltaTime;
      
      // Fade out over lifetime
      const lifePercent = tracer.userData.lifetime / tracer.userData.maxLifetime;
      tracer.material.opacity = 1.0 - lifePercent;
      
      // Remove when expired
      if (lifePercent >= 1.0) {
        this.scene.remove(tracer);
        this.activeTracers.splice(i, 1);
        
        // Return to pool
        if (this.tracerPool.length < this.maxPoolSize) {
          tracer.visible = false;
          this.tracerPool.push(tracer);
        } else {
          tracer.geometry.dispose();
          tracer.material.dispose();
        }
      }
    }
  }
  
  /**
   * Dispose of all resources
   */
  dispose() {
    // Dispose active tracers
    this.activeTracers.forEach(tracer => {
      this.scene.remove(tracer);
      tracer.geometry.dispose();
      tracer.material.dispose();
    });
    
    // Dispose pooled tracers
    this.tracerPool.forEach(tracer => {
      tracer.geometry.dispose();
      tracer.material.dispose();
    });
    
    this.activeTracers = [];
    this.tracerPool = [];
    
    console.log('BulletTracer disposed');
  }
}
