/**
 * Game - Main game class that integrates all gameplay systems
 * Implements client-side prediction interfaces for networking
 */
import { InputManager } from './gameplay/InputManager.js';
import { GameState } from './gameplay/GameState.js';
import { PlayerController } from './gameplay/PlayerController.js';
import { CameraController } from './gameplay/CameraController.js';
import { WeaponSystem } from './gameplay/WeaponSystem.js';
import { HitDetection } from './gameplay/HitDetection.js';
import { HealthSystem } from './gameplay/HealthSystem.js';
import { LoadoutManager } from './gameplay/LoadoutManager.js';
import { WeaponDataLoader } from './weapons/WeaponDataLoader.js';
import { ADSController } from './mechanics/ADSController.js';
import { SpawnSystemClient } from './mechanics/SpawnSystemClient.js';
import { AnimationHooks } from './controllers/AnimationHooks.js';
import { RenderSystem } from './rendering/RenderSystem.js';
import { metrics } from '../performance/metrics.js';

export class Game {
  constructor() {
    // Core systems
    this.inputManager = new InputManager();
    this.gameState = new GameState();
    this.playerController = new PlayerController();
    this.cameraController = new CameraController();
    this.weaponDataLoader = new WeaponDataLoader();
    this.loadoutManager = new LoadoutManager(this.weaponDataLoader);
    this.hitDetection = new HitDetection();
    this.healthSystem = new HealthSystem(100, {
      enableShields: false,
      healthRegen: true,
      healthRegenDelay: 5.0,
      healthRegenRate: 10
    });
    this.adsController = new ADSController();
    this.spawnSystem = new SpawnSystemClient();
    this.animationHooks = new AnimationHooks();
    
    // Rendering system
    this.renderSystem = null;
    
    // Current weapon
    this.currentWeapon = null;
    
    // Game loop
    this.lastTime = 0;
    this.deltaTime = 0;
    this.running = false;
    this.frameCount = 0;
    
    // Client prediction
    this.inputSequence = 0;
    this.pendingInputs = [];
    
    // Performance
    this.targetFPS = 60;
    this.maxDeltaTime = 1 / 30; // Clamp to 30fps minimum
    this.metrics = metrics; // Performance metrics
    
    // Mock data for testing
    this.mockTargets = [];
    
    console.log('Game initialized');
  }
  
  /**
   * Initialize and load game data
   */
  async init() {
    console.log('Loading game data...');
    
    // Initialize rendering system
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      this.renderSystem = new RenderSystem(canvas, { quality: 'high' });
      const renderInit = await this.renderSystem.init();
      if (!renderInit) {
        console.error('Failed to initialize rendering system');
        return false;
      }
      
      // Load default map
      await this.renderSystem.loadMap('arena_hub');
    }
    
    // Load weapon data
    const loaded = await this.weaponDataLoader.loadAll();
    if (!loaded) {
      console.error('Failed to load game data');
      return false;
    }
    
    // Setup default loadout for testing
    this.loadoutManager.equipWeapon('primary', 'ar_mk4');
    this.loadoutManager.equipWeapon('secondary', 'smg_phantom');
    
    // Setup event listeners
    this._setupEventListeners();
    
    console.log('Game initialized successfully');
    return true;
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.gameState.startGame();
    
    // Request pointer lock for FPS controls
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        this.inputManager.requestPointerLock(canvas);
      });
    }
    
    // Equip starting weapon
    this._equipCurrentWeapon();
    
    // Start game loop
    this._gameLoop();
    
    console.log('Game started');
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
    this.gameState.pause();
    console.log('Game stopped');
  }
  
  /**
   * Main game loop
   */
  _gameLoop(currentTime = 0) {
    if (!this.running) return;
    
    // Begin frame measurement
    this.metrics.beginFrame();
    
    // Calculate delta time
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Clamp delta time to avoid large jumps
    this.deltaTime = Math.min(this.deltaTime, this.maxDeltaTime);
    
    // Update game
    if (this.gameState.isPlaying()) {
      this.update(this.deltaTime);
    }
    
    // End frame measurement
    this.metrics.endFrame();
    
    // Continue loop
    requestAnimationFrame((time) => this._gameLoop(time));
    
    this.frameCount++;
  }
  
  /**
   * Update game state
   * @param {Number} dt - Delta time in seconds
   */
  update(dt) {
    // Update input manager
    this.inputManager.update();
    
    // Get input state
    const input = this._gatherInput();
    
    // Apply local input (client-side prediction)
    this.applyLocalInput(input, dt);
    
    // Update systems
    this.healthSystem.update(dt);
    this.spawnSystem.update(dt);
    
    // Update current weapon
    if (this.currentWeapon) {
      this.currentWeapon.update(dt);
    }
    
    // Update rendering system
    if (this.renderSystem) {
      const cameraState = {
        position: {
          x: this.playerController.position.x,
          y: this.playerController.position.y + this.playerController.currentHeight * 0.9,
          z: this.playerController.position.z
        },
        rotation: {
          x: this.cameraController.pitch,
          y: this.cameraController.yaw,
          z: 0
        }
      };
      
      const weaponState = {
        mouseInput: input.look,
        movementState: {
          isMoving: input.move.x !== 0 || input.move.z !== 0
        },
        isADS: this.adsController.inADS()
      };
      
      this.renderSystem.update(dt, cameraState, weaponState, {});
      this.renderSystem.render(dt);
    }
    
    // Emit HUD updates
    this._updateHUD();
  }
  
  /**
   * Gather input state for this frame
   * @private
   */
  _gatherInput() {
    const moveVector = this.inputManager.getMoveVector();
    const mouseDelta = this.inputManager.getMouseDelta(this.adsController.inADS());
    const forward = this.cameraController.getForwardVector();
    const right = this.cameraController.getRightVector();
    
    return {
      seq: this.inputSequence++,
      dt: this.deltaTime,
      timestamp: performance.now(),
      move: moveVector,
      look: mouseDelta,
      forward,
      right,
      actions: {
        fire: this.inputManager.isActionPressed('fire'),
        ads: this.inputManager.isActionPressed('aim'),
        reload: this.inputManager.isActionPressed('reload'),
        jump: this.inputManager.isActionPressed('jump'),
        crouch: this.inputManager.isActionPressed('crouch'),
        sprint: this.inputManager.isActionPressed('sprint'),
        switchWeapon: this.inputManager.isActionPressed('switchWeapon')
      }
    };
  }
  
  /**
   * Apply local input (client-side prediction)
   * Part of networking interface
   * @param {Object} input - Input state
   * @param {Number} dt - Delta time
   */
  applyLocalInput(input, dt) {
    // Store input for reconciliation
    this.pendingInputs.push(input);
    
    // Keep only last 60 inputs (1 second at 60fps)
    if (this.pendingInputs.length > 60) {
      this.pendingInputs.shift();
    }
    
    // Update camera
    this.cameraController.update(input, dt, this.adsController.inADS(), 
      input.move.x !== 0 || input.move.z !== 0);
    
    // Update ADS
    const weaponStats = this.currentWeapon ? this.currentWeapon.stats : null;
    this.adsController.update(input.actions.ads, dt, weaponStats);
    
    // Update player controller
    const playerInput = {
      move: input.move,
      forward: input.forward,
      right: input.right,
      jump: input.actions.jump,
      crouch: input.actions.crouch,
      sprint: input.actions.sprint && !this.adsController.inADS()
    };
    
    this.playerController.update(playerInput, dt, null);
    
    // Handle weapon actions
    if (input.actions.fire && this.currentWeapon) {
      const fireResult = this.currentWeapon.fire(this.playerController.getState());
      
      if (fireResult) {
        // Apply recoil to camera
        this.cameraController.applyRecoil(
          fireResult.recoil.y * 0.01,
          fireResult.recoil.x * 0.01
        );
        
        // Apply recoil to weapon rig
        if (this.renderSystem) {
          this.renderSystem.applyWeaponRecoil(fireResult.recoil.y, fireResult.recoil.x);
        }
        
        // Fire animation hooks
        this.animationHooks.fireMuzzleFlash({
          position: this.playerController.position,
          direction: this.cameraController.getViewDirection(),
          weaponId: this.currentWeapon.weaponData.id
        });
        
        this.animationHooks.fireShellEject({
          position: this.playerController.position,
          weaponId: this.currentWeapon.weaponData.id
        });
        
        // Create muzzle flash effect
        if (this.renderSystem) {
          const muzzlePos = this.renderSystem.getWeaponMuzzlePosition();
          const muzzleDir = this.renderSystem.getWeaponMuzzleDirection();
          if (muzzlePos && muzzleDir) {
            this.renderSystem.createMuzzleFlash(muzzlePos, muzzleDir, this._getWeaponType());
          }
        }
        
        // Perform hit detection
        this._performHitScan(fireResult);
        
        // End spawn protection if firing
        this.spawnSystem.endSpawnProtection();
      }
    }
    
    if (input.actions.reload && this.currentWeapon) {
      if (this.currentWeapon.reload()) {
        this.animationHooks.fireReloadStart({
          weaponId: this.currentWeapon.weaponData.id,
          reloadTime: this.currentWeapon.stats.reload_ms
        });
      }
    }
    
    if (input.actions.switchWeapon) {
      this._switchWeapon();
    }
    
    // Update ADS on weapon
    if (this.currentWeapon) {
      this.currentWeapon.setADS(this.adsController.inADS());
    }
  }
  
  /**
   * Get predicted state for networking
   * Part of networking interface
   */
  getPredictedState() {
    return {
      position: { ...this.playerController.position },
      velocity: { ...this.playerController.velocity },
      rotation: this.cameraController.getRotation(),
      health: this.healthSystem.currentHealth,
      weapon: this.currentWeapon ? this.currentWeapon.getState() : null,
      sequence: this.inputSequence
    };
  }
  
  /**
   * Handle server reconciliation
   * Part of networking interface
   * @param {Object} snapshot - Server state snapshot
   */
  onServerReconcile(snapshot) {
    // Find the input that matches this snapshot
    const inputIndex = this.pendingInputs.findIndex(
      input => input.seq === snapshot.sequence
    );
    
    if (inputIndex === -1) return;
    
    // Check if prediction was correct
    const positionError = Math.sqrt(
      Math.pow(snapshot.position.x - this.playerController.position.x, 2) +
      Math.pow(snapshot.position.y - this.playerController.position.y, 2) +
      Math.pow(snapshot.position.z - this.playerController.position.z, 2)
    );
    
    // If error is significant, reconcile
    if (positionError > 0.1) {
      console.log('Reconciling position, error:', positionError);
      
      // Set to server state
      this.playerController.setState(snapshot);
      this.healthSystem.setState(snapshot.health);
      
      if (this.currentWeapon && snapshot.weapon) {
        this.currentWeapon.setState(snapshot.weapon);
      }
      
      // Re-apply inputs after the snapshot
      const inputsToReplay = this.pendingInputs.slice(inputIndex + 1);
      for (const input of inputsToReplay) {
        this.applyLocalInput(input, input.dt);
      }
    }
    
    // Remove old inputs
    this.pendingInputs = this.pendingInputs.slice(inputIndex + 1);
  }
  
  /**
   * Perform hitscan detection
   * @private
   */
  _performHitScan(fireResult) {
    const origin = {
      x: this.playerController.position.x,
      y: this.playerController.position.y + this.playerController.currentHeight * 0.9,
      z: this.playerController.position.z
    };
    
    const direction = this.cameraController.getViewDirection();
    
    const hit = this.hitDetection.hitscan(
      origin,
      direction,
      fireResult.spread,
      this.mockTargets,
      1000
    );
    
    // Create bullet tracer
    if (this.renderSystem) {
      const endPos = {
        x: origin.x + direction.x * (hit ? hit.distance : 100),
        y: origin.y + direction.y * (hit ? hit.distance : 100),
        z: origin.z + direction.z * (hit ? hit.distance : 100)
      };
      this.renderSystem.createBulletTracer(origin, endPos, 0xffaa00);
    }
    
    if (hit) {
      const damage = this.hitDetection.calculateDamage(
        hit.zone === 'head' ? fireResult.headshotDamage : fireResult.damage,
        hit.zone,
        hit.distance,
        (dmg, dist) => this.currentWeapon.getDamageAtRange(dist)
      );
      
      console.log(`Hit ${hit.zone} at ${hit.distance.toFixed(2)}m for ${damage} damage`);
      
      // Create impact effects
      if (this.renderSystem) {
        const impactPos = {
          x: hit.point.x,
          y: hit.point.y,
          z: hit.point.z
        };
        const impactNormal = { x: 0, y: 1, z: 0 }; // Simple upward normal
        
        // Create impact decal
        this.renderSystem.createImpactDecal(impactPos, impactNormal, 'bullet');
        
        // Create hit marker at impact location
        this.renderSystem.createHitMarker(impactPos, hit.zone === 'head');
        
        // Create blood effect if hitting player
        if (hit.targetId) {
          this.renderSystem.createBloodEffect(impactPos, direction);
        }
      }
      
      // Emit hit event
      window.dispatchEvent(new CustomEvent('hit:local', {
        detail: {
          targetId: hit.targetId,
          damage,
          zone: hit.zone,
          distance: hit.distance,
          weapon: this.currentWeapon.weaponData.id
        }
      }));
      
      // Show hitmarker
      window.dispatchEvent(new CustomEvent('hud:hitmarker', {
        detail: {
          isHeadshot: hit.zone === 'head',
          damage
        }
      }));
    }
  }
  
  /**
   * Switch to next weapon
   * @private
   */
  _switchWeapon() {
    if (this.currentWeapon) {
      this.currentWeapon.unequip();
      this.animationHooks.fireUnequipStart({
        weaponId: this.currentWeapon.weaponData.id
      });
    }
    
    this.loadoutManager.switchToNext();
    this._equipCurrentWeapon();
  }
  
  /**
   * Equip current weapon from loadout
   * @private
   */
  _equipCurrentWeapon() {
    const weaponData = this.loadoutManager.getCurrentWeapon();
    if (!weaponData) return;
    
    const recoilPattern = this.weaponDataLoader.getRecoilPattern(
      weaponData.stats.recoil_pattern
    );
    
    this.currentWeapon = new WeaponSystem(weaponData, recoilPattern);
    
    // Load weapon in render system
    if (this.renderSystem) {
      this.renderSystem.loadWeapon(weaponData.id);
    }
    
    this.animationHooks.fireEquipStart({
      weaponId: weaponData.id,
      equipTime: weaponData.stats.equip_ms
    });
    
    // Emit weapon change event
    window.dispatchEvent(new CustomEvent('hud:weapon:icon', {
      detail: {
        weaponId: weaponData.id,
        name: weaponData.name
      }
    }));
    
    console.log('Equipped:', weaponData.name);
  }
  
  /**
   * Get weapon type for rendering
   * @private
   */
  _getWeaponType() {
    if (!this.currentWeapon) return 'default';
    
    const id = this.currentWeapon.weaponData.id;
    if (id.startsWith('ar_')) return 'rifle';
    if (id.startsWith('smg_')) return 'smg';
    if (id.startsWith('sniper_')) return 'sniper';
    if (id.startsWith('shotgun_')) return 'shotgun';
    if (id.startsWith('pistol_') || id.startsWith('magnum_')) return 'pistol';
    
    return 'default';
  }
  
  /**
   * Update HUD
   * @private
   */
  _updateHUD() {
    if (this.currentWeapon) {
      const spread = this.currentWeapon.spreadModel.getSpread(
        this.adsController.inADS(),
        this.playerController.getState()
      );
      
      window.dispatchEvent(new CustomEvent('hud:crosshair:spread', {
        detail: { spread }
      }));
    }
  }
  
  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for pause action
    window.addEventListener('input:pause', () => {
      if (this.gameState.isPlaying()) {
        this.gameState.pause();
      } else if (this.gameState.isPaused()) {
        this.gameState.resume();
      }
    });
    
    // Listen for game state changes
    this.gameState.on('enter:playing', () => {
      console.log('Game started');
      this.inputManager.enabled = true;
    });
    
    this.gameState.on('enter:paused', () => {
      console.log('Game paused');
      this.inputManager.enabled = false;
    });
    
    this.gameState.on('enter:gameover', (data) => {
      console.log('Game over:', data);
      this.inputManager.enabled = false;
    });
  }
  
  /**
   * Public API for UI/HUD
   */
  getCurrentWeaponStats() {
    return this.currentWeapon ? this.currentWeapon.getCurrentWeaponStats() : null;
  }
  
  getCrosshairState() {
    if (!this.currentWeapon) return { spread: 0 };
    
    return {
      spread: this.currentWeapon.spreadModel.getSpread(
        this.adsController.inADS(),
        this.playerController.getState()
      )
    };
  }
  
  getHealthPercent() {
    return this.healthSystem.getHealthPercent();
  }
}
