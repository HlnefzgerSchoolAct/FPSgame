/**
 * InputManager - Handles keyboard, mouse, and gamepad input with rebinding support
 * Provides accessibility flags and customizable sensitivity
 */
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseButtons = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.scrollDelta = 0;
    
    // Input bindings (customizable)
    this.bindings = {
      moveForward: ['KeyW', 'ArrowUp'],
      moveBackward: ['KeyS', 'ArrowDown'],
      moveLeft: ['KeyA', 'ArrowLeft'],
      moveRight: ['KeyD', 'ArrowRight'],
      jump: ['Space'],
      crouch: ['KeyC', 'ControlLeft'],
      sprint: ['ShiftLeft'],
      fire: ['Mouse0'],
      aim: ['Mouse2'],
      reload: ['KeyR'],
      switchWeapon: ['KeyQ'],
      interact: ['KeyE'],
      melee: ['KeyV'],
      grenade: ['KeyG'],
      slot1: ['Digit1'],
      slot2: ['Digit2'],
      slot3: ['Digit3'],
      pause: ['Escape']
    };
    
    // Mouse settings
    this.mouseSensitivity = 0.002;
    this.adsMultiplier = 0.6;
    this.invertY = false;
    
    // Accessibility
    this.holdToCrouch = false;
    this.holdToSprint = true;
    this.holdToADS = true;
    
    // Gamepad support
    this.gamepadIndex = null;
    this.gamepadDeadzone = 0.15;
    
    this.locked = false;
    this.enabled = true;
    
    this._setupListeners();
  }
  
  _setupListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys[e.code] = true;
      this._dispatchAction('keydown', e.code);
    });
    
    window.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      this.keys[e.code] = false;
      this._dispatchAction('keyup', e.code);
    });
    
    // Mouse events
    window.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      this.mouseButtons[`Mouse${e.button}`] = true;
      this._dispatchAction('mousedown', `Mouse${e.button}`);
    });
    
    window.addEventListener('mouseup', (e) => {
      if (!this.enabled) return;
      this.mouseButtons[`Mouse${e.button}`] = false;
      this._dispatchAction('mouseup', `Mouse${e.button}`);
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      this.mouseDelta.x = e.movementX || 0;
      this.mouseDelta.y = e.movementY || 0;
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
    
    window.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      this.scrollDelta = e.deltaY;
    });
    
    // Pointer lock
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement !== null;
    });
    
    // Gamepad connection
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      if (this.gamepadIndex === null) {
        this.gamepadIndex = e.gamepad.index;
      }
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
      }
    });
  }
  
  _dispatchAction(type, code) {
    // Find action for this code
    for (const [action, codes] of Object.entries(this.bindings)) {
      if (codes.includes(code)) {
        window.dispatchEvent(new CustomEvent(`input:${action}`, { 
          detail: { type, action, code } 
        }));
      }
    }
  }
  
  requestPointerLock(element) {
    element.requestPointerLock();
  }
  
  exitPointerLock() {
    document.exitPointerLock();
  }
  
  isActionPressed(action) {
    if (!this.enabled) return false;
    const codes = this.bindings[action] || [];
    return codes.some(code => {
      if (code.startsWith('Mouse')) {
        return this.mouseButtons[code];
      }
      return this.keys[code];
    });
  }
  
  getMouseDelta(applyADS = false) {
    const sensitivity = this.mouseSensitivity * (applyADS ? this.adsMultiplier : 1.0);
    const invertMultiplier = this.invertY ? -1 : 1;
    return {
      x: this.mouseDelta.x * sensitivity,
      y: this.mouseDelta.y * sensitivity * invertMultiplier
    };
  }
  
  getMoveVector() {
    const vector = { x: 0, y: 0, z: 0 };
    
    if (this.isActionPressed('moveForward')) vector.z -= 1;
    if (this.isActionPressed('moveBackward')) vector.z += 1;
    if (this.isActionPressed('moveLeft')) vector.x -= 1;
    if (this.isActionPressed('moveRight')) vector.x += 1;
    
    // Normalize diagonal movement
    const length = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
    if (length > 0) {
      vector.x /= length;
      vector.z /= length;
    }
    
    return vector;
  }
  
  getGamepadState() {
    if (this.gamepadIndex === null) return null;
    
    const gamepad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamepad) return null;
    
    const applyDeadzone = (value) => {
      return Math.abs(value) < this.gamepadDeadzone ? 0 : value;
    };
    
    return {
      leftStick: {
        x: applyDeadzone(gamepad.axes[0] || 0),
        y: applyDeadzone(gamepad.axes[1] || 0)
      },
      rightStick: {
        x: applyDeadzone(gamepad.axes[2] || 0),
        y: applyDeadzone(gamepad.axes[3] || 0)
      },
      buttons: gamepad.buttons.map(b => b.pressed)
    };
  }
  
  rebindAction(action, newCodes) {
    if (this.bindings[action]) {
      this.bindings[action] = Array.isArray(newCodes) ? newCodes : [newCodes];
    }
  }
  
  reset() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.scrollDelta = 0;
  }
  
  update() {
    // Reset per-frame values
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.scrollDelta = 0;
  }
}
