/**
 * FirstPersonRig.js - First-person weapon viewmodel rig
 * Handles weapon sway, bob, ADS transitions, and muzzle socket positioning
 */
import * as THREE from 'three';

export class FirstPersonRig {
  constructor(weaponScene) {
    this.weaponScene = weaponScene;
    
    // Weapon container
    this.rigContainer = new THREE.Group();
    this.rigContainer.name = 'weapon_rig';
    this.weaponScene.add(this.rigContainer);
    
    // Current weapon mesh
    this.weaponMesh = null;
    this.muzzleSocket = new THREE.Object3D();
    this.muzzleSocket.name = 'muzzle_socket';
    
    // Weapon position and rotation
    this.basePosition = new THREE.Vector3(0.3, -0.2, -0.5);
    this.adsPosition = new THREE.Vector3(0, -0.15, -0.3);
    this.currentPosition = this.basePosition.clone();
    
    // Sway parameters
    this.swayAmount = 0.02;
    this.swaySmooth = 5.0;
    this.swayTarget = new THREE.Vector2(0, 0);
    this.swayCurrent = new THREE.Vector2(0, 0);
    
    // Bob parameters
    this.bobAmount = 0.03;
    this.bobSpeed = 10.0;
    this.bobTime = 0;
    this.isMoving = false;
    
    // ADS state
    this.isADS = false;
    this.adsTransition = 0.0; // 0 = hip, 1 = ADS
    this.adsTransitionSpeed = 8.0;
    
    // Recoil animation
    this.recoilOffset = new THREE.Vector3(0, 0, 0);
    this.recoilRecovery = 10.0;
    
    console.log('FirstPersonRig created');
  }
  
  /**
   * Load a weapon model
   */
  loadWeapon(weaponId) {
    // Remove current weapon
    if (this.weaponMesh) {
      this.rigContainer.remove(this.weaponMesh);
      if (this.weaponMesh.geometry) this.weaponMesh.geometry.dispose();
      if (this.weaponMesh.material) this.weaponMesh.material.dispose();
    }
    
    // Create placeholder weapon mesh
    const weaponGeometry = this._getWeaponGeometry(weaponId);
    const weaponMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.8
    });
    
    this.weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
    this.weaponMesh.castShadow = false; // Weapons don't cast shadows in FP view
    this.weaponMesh.name = `weapon_${weaponId}`;
    
    // Setup muzzle socket position
    this.muzzleSocket.position.set(0, 0.1, -0.8); // Front of weapon
    this.weaponMesh.add(this.muzzleSocket);
    
    // Add weapon to rig
    this.rigContainer.add(this.weaponMesh);
    this.rigContainer.position.copy(this.basePosition);
    
    console.log(`Weapon ${weaponId} loaded`);
  }
  
  /**
   * Get weapon geometry based on weapon type
   * @private
   */
  _getWeaponGeometry(weaponId) {
    // Create different geometries for different weapon types
    if (weaponId.startsWith('ar_') || weaponId.startsWith('smg_')) {
      // Rifle/SMG shape
      const group = new THREE.Group();
      
      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      body.position.z = -0.3;
      group.add(body);
      
      // Barrel
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, -0.65);
      group.add(barrel);
      
      // Magazine
      const mag = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.15, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      mag.position.set(0, -0.1, -0.25);
      group.add(mag);
      
      // Stock
      const stock = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      stock.position.z = 0.05;
      group.add(stock);
      
      return group;
    } else if (weaponId.startsWith('pistol_') || weaponId.startsWith('magnum_')) {
      // Pistol shape
      const group = new THREE.Group();
      
      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.08, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      body.position.z = -0.35;
      group.add(body);
      
      // Barrel
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, -0.45);
      group.add(barrel);
      
      return group;
    } else {
      // Default box for unknown types
      return new THREE.BoxGeometry(0.1, 0.1, 0.5);
    }
  }
  
  /**
   * Update weapon rig
   */
  update(deltaTime, mouseInput, movementState, adsState) {
    this.isADS = adsState;
    this.isMoving = movementState.isMoving;
    
    // Update ADS transition
    const adsTarget = this.isADS ? 1.0 : 0.0;
    this.adsTransition += (adsTarget - this.adsTransition) * this.adsTransitionSpeed * deltaTime;
    
    // Update weapon sway
    this._updateSway(deltaTime, mouseInput);
    
    // Update weapon bob
    this._updateBob(deltaTime);
    
    // Update recoil
    this._updateRecoil(deltaTime);
    
    // Apply position
    this._applyPosition();
  }
  
  /**
   * Update weapon sway from mouse movement
   * @private
   */
  _updateSway(deltaTime, mouseInput) {
    if (!mouseInput) return;
    
    // Target sway based on mouse movement
    this.swayTarget.x = -mouseInput.x * this.swayAmount;
    this.swayTarget.y = -mouseInput.y * this.swayAmount;
    
    // Smooth interpolation
    this.swayCurrent.x += (this.swayTarget.x - this.swayCurrent.x) * this.swaySmooth * deltaTime;
    this.swayCurrent.y += (this.swayTarget.y - this.swayCurrent.y) * this.swaySmooth * deltaTime;
    
    // Decay target back to center
    this.swayTarget.multiplyScalar(0.9);
  }
  
  /**
   * Update weapon bob from movement
   * @private
   */
  _updateBob(deltaTime) {
    if (this.isMoving && !this.isADS) {
      this.bobTime += deltaTime * this.bobSpeed;
    } else {
      // Decay bob time when not moving
      this.bobTime *= 0.95;
    }
  }
  
  /**
   * Update recoil recovery
   * @private
   */
  _updateRecoil(deltaTime) {
    // Recover from recoil
    this.recoilOffset.multiplyScalar(Math.max(0, 1 - this.recoilRecovery * deltaTime));
  }
  
  /**
   * Apply all offsets to weapon position
   * @private
   */
  _applyPosition() {
    // Lerp between hip and ADS position
    this.currentPosition.lerpVectors(
      this.basePosition,
      this.adsPosition,
      this.adsTransition
    );
    
    // Apply sway (reduced during ADS)
    const swayMultiplier = 1.0 - this.adsTransition * 0.7;
    const swayX = this.swayCurrent.x * swayMultiplier;
    const swayY = this.swayCurrent.y * swayMultiplier;
    
    // Apply bob (disabled during ADS)
    const bobMultiplier = 1.0 - this.adsTransition;
    const bobY = Math.sin(this.bobTime) * this.bobAmount * bobMultiplier;
    const bobX = Math.sin(this.bobTime * 0.5) * this.bobAmount * 0.5 * bobMultiplier;
    
    // Combine all offsets
    this.rigContainer.position.set(
      this.currentPosition.x + swayX + bobX + this.recoilOffset.x,
      this.currentPosition.y + swayY + bobY + this.recoilOffset.y,
      this.currentPosition.z + this.recoilOffset.z
    );
    
    // Apply rotation sway
    this.rigContainer.rotation.set(
      swayY * 0.5,
      swayX * 0.5,
      -swayX * 0.3
    );
  }
  
  /**
   * Apply recoil to weapon
   */
  applyRecoil(vertical, horizontal) {
    this.recoilOffset.y -= vertical * 0.01;
    this.recoilOffset.z += vertical * 0.02;
    this.recoilOffset.x += horizontal * 0.01;
  }
  
  /**
   * Get muzzle position in world space
   */
  getMuzzlePosition() {
    const worldPos = new THREE.Vector3();
    this.muzzleSocket.getWorldPosition(worldPos);
    return worldPos;
  }
  
  /**
   * Get muzzle direction in world space
   */
  getMuzzleDirection() {
    const worldDir = new THREE.Vector3(0, 0, -1);
    this.muzzleSocket.getWorldDirection(worldDir);
    return worldDir;
  }
  
  /**
   * Set ADS FOV offset
   */
  getADSFOVOffset() {
    return this.adsTransition * -15; // Reduce FOV by 15 degrees when fully in ADS
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    if (this.weaponMesh) {
      this.rigContainer.remove(this.weaponMesh);
      if (this.weaponMesh.geometry) {
        if (this.weaponMesh.geometry.dispose) {
          this.weaponMesh.geometry.dispose();
        } else {
          // Handle group
          this.weaponMesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        }
      }
      if (this.weaponMesh.material) this.weaponMesh.material.dispose();
    }
    
    this.weaponScene.remove(this.rigContainer);
    console.log('FirstPersonRig disposed');
  }
}
