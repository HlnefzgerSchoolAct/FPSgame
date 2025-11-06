/**
 * ColorBlindModes
 * Accessibility feature for colorblind users
 */

export class ColorBlindModes {
  constructor() {
    this.currentMode = 'none';
    this.modes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
  }

  setMode(mode) {
    if (!this.modes.includes(mode)) {
      console.warn(`Invalid colorblind mode: ${mode}`);
      return;
    }

    // Remove all colorblind classes
    this.modes.forEach(m => {
      if (m !== 'none') {
        document.body.classList.remove(`colorblind-${m}`);
      }
    });

    // Add new mode class
    if (mode !== 'none') {
      document.body.classList.add(`colorblind-${mode}`);
    }

    this.currentMode = mode;
    
    // Save preference
    localStorage.setItem('colorblind-mode', mode);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('accessibility:colorblind:changed', {
      detail: { mode }
    }));
  }

  getCurrentMode() {
    return this.currentMode;
  }

  init() {
    // Load saved preference
    const savedMode = localStorage.getItem('colorblind-mode');
    if (savedMode && this.modes.includes(savedMode)) {
      this.setMode(savedMode);
    }
  }
}

export const colorBlindModes = new ColorBlindModes();
