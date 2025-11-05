/**
 * AnimationHooks - Events fired for muzzle, reload, equip (consumed by graphics-agent)
 */
export class AnimationHooks {
  constructor() {
    this.listeners = {};
    
    // Animation event types
    this.events = {
      MUZZLE_FLASH: 'anim:muzzle:flash',
      SHELL_EJECT: 'anim:shell:eject',
      RELOAD_START: 'anim:reload:start',
      RELOAD_MAG_OUT: 'anim:reload:mag:out',
      RELOAD_MAG_IN: 'anim:reload:mag:in',
      RELOAD_COMPLETE: 'anim:reload:complete',
      EQUIP_START: 'anim:equip:start',
      EQUIP_COMPLETE: 'anim:equip:complete',
      UNEQUIP_START: 'anim:unequip:start',
      UNEQUIP_COMPLETE: 'anim:unequip:complete',
      ADS_START: 'anim:ads:start',
      ADS_COMPLETE: 'anim:ads:complete',
      ADS_EXIT: 'anim:ads:exit',
      MELEE_START: 'anim:melee:start',
      MELEE_HIT: 'anim:melee:hit',
      SPRINT_START: 'anim:sprint:start',
      SPRINT_STOP: 'anim:sprint:stop',
      SLIDE_START: 'anim:slide:start',
      SLIDE_STOP: 'anim:slide:stop'
    };
  }
  
  /**
   * Fire muzzle flash animation
   * @param {Object} data - {position, direction, weaponId}
   */
  fireMuzzleFlash(data) {
    this._emit(this.events.MUZZLE_FLASH, data);
  }
  
  /**
   * Fire shell ejection animation
   * @param {Object} data - {position, direction, weaponId, shellType}
   */
  fireShellEject(data) {
    this._emit(this.events.SHELL_EJECT, data);
  }
  
  /**
   * Fire reload start animation
   * @param {Object} data - {weaponId, reloadTime}
   */
  fireReloadStart(data) {
    this._emit(this.events.RELOAD_START, data);
  }
  
  /**
   * Fire magazine out animation point
   * @param {Object} data - {weaponId, timestamp}
   */
  fireReloadMagOut(data) {
    this._emit(this.events.RELOAD_MAG_OUT, data);
  }
  
  /**
   * Fire magazine in animation point
   * @param {Object} data - {weaponId, timestamp}
   */
  fireReloadMagIn(data) {
    this._emit(this.events.RELOAD_MAG_IN, data);
  }
  
  /**
   * Fire reload complete animation
   * @param {Object} data - {weaponId}
   */
  fireReloadComplete(data) {
    this._emit(this.events.RELOAD_COMPLETE, data);
  }
  
  /**
   * Fire weapon equip start
   * @param {Object} data - {weaponId, equipTime}
   */
  fireEquipStart(data) {
    this._emit(this.events.EQUIP_START, data);
  }
  
  /**
   * Fire weapon equip complete
   * @param {Object} data - {weaponId}
   */
  fireEquipComplete(data) {
    this._emit(this.events.EQUIP_COMPLETE, data);
  }
  
  /**
   * Fire weapon unequip start
   * @param {Object} data - {weaponId}
   */
  fireUnequipStart(data) {
    this._emit(this.events.UNEQUIP_START, data);
  }
  
  /**
   * Fire ADS start
   * @param {Object} data - {weaponId, adsTime}
   */
  fireADSStart(data) {
    this._emit(this.events.ADS_START, data);
  }
  
  /**
   * Fire ADS complete
   * @param {Object} data - {weaponId}
   */
  fireADSComplete(data) {
    this._emit(this.events.ADS_COMPLETE, data);
  }
  
  /**
   * Fire ADS exit
   * @param {Object} data - {weaponId}
   */
  fireADSExit(data) {
    this._emit(this.events.ADS_EXIT, data);
  }
  
  /**
   * Register listener for animation events
   * @param {String} event - Event type from this.events
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  /**
   * Unregister listener
   * @param {String} event - Event type
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Emit animation event
   * @private
   */
  _emit(event, data) {
    // Call registered listeners
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
    
    // Also emit as DOM event for external systems
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}
