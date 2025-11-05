/**
 * RenderSystem.js - Main rendering system coordinator
 * Integrates Renderer, SceneManager, FirstPersonRig, Effects, and PostProcessing
 */
import { Renderer } from './Renderer.js';
import { SceneManager } from './SceneManager.js';
import { FirstPersonRig } from './FirstPersonRig.js';
import { MapLoader } from '../scene/MapLoader.js';
import { PostProcessing } from './Post/PostProcessing.js';
import { MuzzleFlash } from './Effects/MuzzleFlash.js';
import { BulletTracer } from './Effects/BulletTracer.js';
import { ImpactDecals } from './Effects/ImpactDecals.js';
import { BloodFX } from './Effects/BloodFX.js';
import { HitMarkerFX } from './Effects/HitMarkerFX.js';
import { DamageVignette } from './Effects/DamageVignette.js';

export class RenderSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    
    // Core rendering components
    this.renderer = null;
    this.sceneManager = null;
    this.weaponRig = null;
    this.mapLoader = null;
    this.postProcessing = null;
    
    // Effects
    this.effects = {
      muzzleFlash: null,
      bulletTracer: null,
      impactDecals: null,
      bloodFX: null,
      hitMarker: null,
      damageVignette: null
    };
    
    // Performance monitoring
    this.stats = {
      fps: 0,
      renderTime: 0,
      drawCalls: 0,
      triangles: 0
    };
    
    this.initialized = false;
    
    console.log('RenderSystem created');
  }
  
  /**
   * Initialize the rendering system
   */
  async init() {
    try {
      console.log('Initializing RenderSystem...');
      
      // Initialize renderer
      this.renderer = new Renderer(this.canvas, this.options);
      if (!this.renderer.init()) {
        throw new Error('Failed to initialize renderer');
      }
      
      // Initialize scene manager
      this.sceneManager = new SceneManager(this.renderer);
      
      // Initialize weapon rig
      this.weaponRig = new FirstPersonRig(this.renderer.getWeaponScene());
      
      // Initialize map loader
      this.mapLoader = new MapLoader(this.sceneManager);
      
      // Initialize post-processing
      const cameras = this.renderer.getCameras();
      this.postProcessing = new PostProcessing(
        this.renderer.renderer,
        this.renderer.getWorldScene(),
        cameras.world
      );
      this.postProcessing.init();
      
      // Initialize effects
      this._initEffects();
      
      this.initialized = true;
      console.log('RenderSystem initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize RenderSystem:', error);
      return false;
    }
  }
  
  /**
   * Initialize visual effects
   * @private
   */
  _initEffects() {
    const worldScene = this.renderer.getWorldScene();
    
    this.effects.muzzleFlash = new MuzzleFlash(worldScene);
    this.effects.bulletTracer = new BulletTracer(worldScene);
    this.effects.impactDecals = new ImpactDecals(worldScene);
    this.effects.bloodFX = new BloodFX(worldScene);
    this.effects.hitMarker = new HitMarkerFX(worldScene);
    this.effects.damageVignette = new DamageVignette();
    
    console.log('Effects initialized');
  }
  
  /**
   * Load a map
   */
  async loadMap(mapId) {
    if (!this.initialized) {
      console.error('RenderSystem not initialized');
      return false;
    }
    
    return await this.mapLoader.loadMap(mapId);
  }
  
  /**
   * Load weapon viewmodel
   */
  loadWeapon(weaponId) {
    if (this.weaponRig) {
      this.weaponRig.loadWeapon(weaponId);
    }
  }
  
  /**
   * Update the rendering system
   */
  update(deltaTime, cameraState, weaponState, gameState) {
    if (!this.initialized) return;
    
    // Update camera position and rotation
    if (cameraState) {
      const weaponOffset = { x: 0, y: 0, z: 0 };
      this.renderer.updateCameras(cameraState.position, cameraState.rotation, weaponOffset);
    }
    
    // Update weapon rig
    if (this.weaponRig && weaponState) {
      this.weaponRig.update(
        deltaTime,
        weaponState.mouseInput || { x: 0, y: 0 },
        weaponState.movementState || { isMoving: false },
        weaponState.isADS || false
      );
    }
    
    // Update scene LOD
    if (cameraState && this.sceneManager) {
      this.sceneManager.updateLOD(cameraState.position);
    }
    
    // Update effects
    const cameras = this.renderer.getCameras();
    const cameraPos = cameras.world ? cameras.world.position : null;
    
    this.effects.muzzleFlash.update(deltaTime);
    this.effects.bulletTracer.update(deltaTime);
    this.effects.impactDecals.update(deltaTime);
    this.effects.bloodFX.update(deltaTime);
    this.effects.hitMarker.update(deltaTime, cameraPos);
    this.effects.damageVignette.update(deltaTime);
  }
  
  /**
   * Render the scene
   */
  render(deltaTime) {
    if (!this.initialized) return;
    
    this.renderer.render(deltaTime);
    
    // Update stats
    const rendererStats = this.renderer.getStats();
    this.stats.renderTime = rendererStats.renderTime;
    this.stats.drawCalls = rendererStats.drawCalls;
    this.stats.triangles = rendererStats.triangles;
  }
  
  /**
   * Create muzzle flash effect
   */
  createMuzzleFlash(position, direction, weaponType) {
    this.effects.muzzleFlash.createFlash(position, direction, weaponType);
  }
  
  /**
   * Create bullet tracer effect
   */
  createBulletTracer(start, end, color) {
    this.effects.bulletTracer.createTracer(start, end, color);
  }
  
  /**
   * Create impact decal
   */
  createImpactDecal(position, normal, type) {
    this.effects.impactDecals.createDecal(position, normal, type);
  }
  
  /**
   * Create blood effect
   */
  createBloodEffect(position, direction) {
    this.effects.bloodFX.createBloodSplatter(position, direction);
  }
  
  /**
   * Create hit marker
   */
  createHitMarker(position, isHeadshot) {
    this.effects.hitMarker.createMarker(position, isHeadshot);
  }
  
  /**
   * Show damage vignette
   */
  showDamageVignette(amount) {
    this.effects.damageVignette.showDamage(amount);
  }
  
  /**
   * Apply recoil to weapon
   */
  applyWeaponRecoil(vertical, horizontal) {
    if (this.weaponRig) {
      this.weaponRig.applyRecoil(vertical, horizontal);
    }
  }
  
  /**
   * Get muzzle position for weapon
   */
  getWeaponMuzzlePosition() {
    return this.weaponRig ? this.weaponRig.getMuzzlePosition() : null;
  }
  
  /**
   * Get muzzle direction for weapon
   */
  getWeaponMuzzleDirection() {
    return this.weaponRig ? this.weaponRig.getMuzzleDirection() : null;
  }
  
  /**
   * Set rendering quality
   */
  setQuality(quality) {
    if (this.renderer) {
      this.renderer.updateQuality(quality);
    }
    if (this.postProcessing) {
      this.postProcessing.setQuality(quality);
    }
  }
  
  /**
   * Get spawn points for team
   */
  getSpawnPoints(team) {
    return this.mapLoader ? this.mapLoader.getSpawnPoints(team) : [];
  }
  
  /**
   * Get objective locations
   */
  getObjectiveLocations(mode) {
    return this.mapLoader ? this.mapLoader.getObjectiveLocations(mode) : [];
  }
  
  /**
   * Get performance stats
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Handle window resize
   */
  resize() {
    if (this.renderer) {
      this.renderer.resize();
    }
    if (this.postProcessing) {
      this.postProcessing.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
  }
  
  /**
   * Dispose of all resources
   */
  dispose() {
    console.log('Disposing RenderSystem...');
    
    // Dispose effects
    Object.values(this.effects).forEach(effect => {
      if (effect && effect.dispose) {
        effect.dispose();
      }
    });
    
    // Dispose post-processing
    if (this.postProcessing) {
      this.postProcessing.dispose();
    }
    
    // Dispose weapon rig
    if (this.weaponRig) {
      this.weaponRig.dispose();
    }
    
    // Dispose scene manager
    if (this.sceneManager) {
      this.sceneManager.unloadMap();
    }
    
    // Dispose map loader
    if (this.mapLoader) {
      this.mapLoader.dispose();
    }
    
    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.initialized = false;
    console.log('RenderSystem disposed');
  }
}
