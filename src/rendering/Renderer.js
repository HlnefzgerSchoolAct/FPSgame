/**
 * Renderer.js - Main Three.js renderer with dual camera setup
 * Initializes WebGL, manages world and weapon cameras, handles tone mapping
 */
import * as THREE from 'three';

export class Renderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      antialias: options.antialias !== undefined ? options.antialias : true,
      powerPreference: options.powerPreference || 'high-performance',
      stencil: options.stencil !== undefined ? options.stencil : false,
      ...options
    };
    
    // Three.js components
    this.renderer = null;
    this.worldScene = null;
    this.weaponScene = null;
    this.worldCamera = null;
    this.weaponCamera = null;
    
    // Render settings
    this.quality = options.quality || 'high'; // 'low', 'medium', 'high'
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    
    // Performance monitoring
    this.stats = null;
    this.renderTime = 0;
    this.frameCount = 0;
    
    console.log('Renderer created');
  }
  
  /**
   * Initialize the renderer
   */
  init() {
    try {
      // Create WebGL renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: this.options.antialias,
        powerPreference: this.options.powerPreference,
        stencil: this.options.stencil
      });
      
      // Set output encoding for correct color space
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      
      // Enable shadows with quality settings
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this._getShadowMapType();
      
      // Set pixel ratio based on quality
      this.updateQuality(this.quality);
      
      // Create scenes
      this.worldScene = new THREE.Scene();
      this.worldScene.background = new THREE.Color(0x1a1a2e);
      this.worldScene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
      
      this.weaponScene = new THREE.Scene();
      // Weapon scene has no background or fog
      
      // Create cameras
      this._createCameras();
      
      // Handle resize
      this.resize();
      window.addEventListener('resize', () => this.resize());
      
      // Setup for Spector.js debugging
      if (window.SPECTOR) {
        console.log('Spector.js detected - WebGL debugging available');
      }
      
      console.log('Renderer initialized successfully');
      console.log('Quality:', this.quality);
      console.log('WebGL Renderer:', this.renderer.capabilities);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize renderer:', error);
      return false;
    }
  }
  
  /**
   * Create world and weapon cameras
   * @private
   */
  _createCameras() {
    // World camera - normal FOV for world rendering
    this.worldCamera = new THREE.PerspectiveCamera(
      75, // FOV
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1, // Near plane
      1000 // Far plane
    );
    this.worldCamera.position.set(0, 1.7, 0); // Eye height
    
    // Weapon camera - separate FOV to avoid clipping
    // Higher FOV for weapon visibility, rendered on top
    this.weaponCamera = new THREE.PerspectiveCamera(
      60, // Slightly lower FOV for weapons
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.01, // Very close near plane for weapon models
      10 // Only render close objects
    );
    this.weaponCamera.position.copy(this.worldCamera.position);
    this.weaponCamera.rotation.copy(this.worldCamera.rotation);
  }
  
  /**
   * Get shadow map type based on quality
   * @private
   */
  _getShadowMapType() {
    switch (this.quality) {
      case 'low':
        return THREE.BasicShadowMap;
      case 'medium':
        return THREE.PCFShadowMap;
      case 'high':
        return THREE.PCFSoftShadowMap;
      default:
        return THREE.PCFShadowMap;
    }
  }
  
  /**
   * Update quality settings
   */
  updateQuality(quality) {
    this.quality = quality;
    
    // Adjust pixel ratio based on quality
    switch (quality) {
      case 'low':
        this.pixelRatio = 1;
        break;
      case 'medium':
        this.pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        break;
      case 'high':
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        break;
    }
    
    if (this.renderer) {
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.shadowMap.type = this._getShadowMapType();
      console.log(`Quality updated to ${quality}, pixel ratio: ${this.pixelRatio}`);
    }
  }
  
  /**
   * Handle window resize
   */
  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    
    if (this.renderer) {
      this.renderer.setSize(this.width, this.height, false);
    }
    
    if (this.worldCamera) {
      this.worldCamera.aspect = this.width / this.height;
      this.worldCamera.updateProjectionMatrix();
    }
    
    if (this.weaponCamera) {
      this.weaponCamera.aspect = this.width / this.height;
      this.weaponCamera.updateProjectionMatrix();
    }
  }
  
  /**
   * Update camera positions and rotations
   */
  updateCameras(position, rotation, weaponOffset = { x: 0, y: 0, z: 0 }) {
    // Update world camera
    if (this.worldCamera) {
      this.worldCamera.position.set(position.x, position.y, position.z);
      this.worldCamera.rotation.set(rotation.x, rotation.y, rotation.z);
    }
    
    // Update weapon camera - follows world camera with offset
    if (this.weaponCamera) {
      this.weaponCamera.position.copy(this.worldCamera.position);
      this.weaponCamera.rotation.copy(this.worldCamera.rotation);
      
      // Apply weapon-specific offset (for weapon sway, bob, etc.)
      this.weaponCamera.position.x += weaponOffset.x;
      this.weaponCamera.position.y += weaponOffset.y;
      this.weaponCamera.position.z += weaponOffset.z;
    }
  }
  
  /**
   * Render both scenes
   */
  render(deltaTime) {
    if (!this.renderer) return;
    
    const startTime = performance.now();
    
    // Clear the entire screen
    this.renderer.clear();
    
    // Render world scene
    this.renderer.render(this.worldScene, this.worldCamera);
    
    // Render weapon scene on top (without clearing depth buffer for correct occlusion)
    this.renderer.clearDepth();
    this.renderer.render(this.weaponScene, this.weaponCamera);
    
    // Track render time for performance monitoring
    this.renderTime = performance.now() - startTime;
    this.frameCount++;
  }
  
  /**
   * Get render statistics
   */
  getStats() {
    const info = this.renderer ? this.renderer.info : null;
    return {
      renderTime: this.renderTime,
      triangles: info ? info.render.triangles : 0,
      drawCalls: info ? info.render.calls : 0,
      geometries: info ? info.memory.geometries : 0,
      textures: info ? info.memory.textures : 0,
      frameCount: this.frameCount
    };
  }
  
  /**
   * Enable/disable Stats.js integration
   */
  setStatsPanel(stats) {
    this.stats = stats;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    if (this.renderer) {
      // Dispose scenes
      if (this.worldScene) {
        this.worldScene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      if (this.weaponScene) {
        this.weaponScene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      this.renderer.dispose();
      console.log('Renderer disposed');
    }
  }
  
  /**
   * Get world scene for adding objects
   */
  getWorldScene() {
    return this.worldScene;
  }
  
  /**
   * Get weapon scene for adding viewmodel
   */
  getWeaponScene() {
    return this.weaponScene;
  }
  
  /**
   * Get cameras
   */
  getCameras() {
    return {
      world: this.worldCamera,
      weapon: this.weaponCamera
    };
  }
  
  /**
   * Set tone mapping exposure
   */
  setExposure(exposure) {
    if (this.renderer) {
      this.renderer.toneMappingExposure = exposure;
    }
  }
}
