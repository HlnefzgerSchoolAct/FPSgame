/**
 * Settings Component
 * Game settings menu with accessibility options
 */

import { Button } from '../Components/Button.js';
import { Toggle } from '../Components/Toggle.js';
import { Dropdown } from '../Components/Dropdown.js';
import { Toast } from '../Components/Toast.js';
import { i18n } from '../LocalizationManager.js';
import { colorBlindModes } from '../Accessibility/ColorBlindModes.js';

export class Settings {
  constructor(options = {}) {
    const { onClose = null } = options;
    this.onClose = onClose;
    this.element = null;
    this.currentSection = 'video';
    this.settings = this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      // Video
      graphicsQuality: 'high',
      resolution: 'auto',
      fullscreen: true,
      vsync: true,
      fpsLimit: 144,
      fov: 90,
      
      // Audio
      masterVolume: 80,
      musicVolume: 60,
      sfxVolume: 80,
      voiceVolume: 70,
      
      // Controls
      mouseSensitivity: 50,
      adsSensitivity: 40,
      invertY: false,
      
      // Accessibility
      colorblindMode: 'none',
      highContrast: false,
      textScale: 'normal',
      reducedMotion: false,
      
      // HUD
      crosshairColor: '#ffffff',
      crosshairSize: 40,
      hudOpacity: 100,
      showFPS: false
    };
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'menu-container settings-container';
    this.element.id = 'settings-menu';

    const title = document.createElement('h1');
    title.textContent = i18n.t('settings.title');
    this.element.appendChild(title);

    // Section tabs
    const sections = document.createElement('div');
    sections.className = 'settings-sections';
    
    const sectionNames = ['video', 'audio', 'controls', 'accessibility'];
    sectionNames.forEach(section => {
      const tab = document.createElement('button');
      tab.className = 'settings-section-tab';
      if (section === this.currentSection) tab.classList.add('active');
      tab.textContent = i18n.t(`settings.${section}`);
      tab.addEventListener('click', () => this.switchSection(section));
      sections.appendChild(tab);
    });
    this.element.appendChild(sections);

    // Settings content
    const content = document.createElement('div');
    content.className = 'settings-content';
    content.id = 'settings-content';
    this.element.appendChild(content);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'settings-buttons flex gap-md';
    buttonContainer.style.marginTop = 'var(--space-xl)';

    const saveButton = new Button({
      label: i18n.t('settings.save_changes'),
      variant: 'primary',
      onClick: () => this.saveSettings()
    });

    const cancelButton = new Button({
      label: i18n.t('common.cancel'),
      variant: 'secondary',
      onClick: () => {
        if (this.onClose) this.onClose();
      }
    });

    buttonContainer.appendChild(saveButton.create());
    buttonContainer.appendChild(cancelButton.create());
    this.element.appendChild(buttonContainer);

    // Load initial section
    this.renderSection(this.currentSection);

    return this.element;
  }

  switchSection(section) {
    this.currentSection = section;
    
    const tabs = this.element.querySelectorAll('.settings-section-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent === i18n.t(`settings.${section}`)) {
        tab.classList.add('active');
      }
    });

    this.renderSection(section);
  }

  renderSection(section) {
    const content = document.getElementById('settings-content');
    if (!content) return;

    content.innerHTML = '';

    switch (section) {
      case 'video':
        this.renderVideoSettings(content);
        break;
      case 'audio':
        this.renderAudioSettings(content);
        break;
      case 'controls':
        this.renderControlsSettings(content);
        break;
      case 'accessibility':
        this.renderAccessibilitySettings(content);
        break;
    }
  }

  renderVideoSettings(container) {
    const group = this.createSettingsGroup(i18n.t('settings.video'));

    // Graphics Quality
    const quality = new Dropdown({
      label: i18n.t('settings.graphics_quality'),
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'ultra', label: 'Ultra' }
      ],
      value: this.settings.graphicsQuality,
      onChange: (value) => this.settings.graphicsQuality = value
    });
    group.appendChild(this.createSettingItem(quality.create()));

    // Fullscreen
    const fullscreen = new Toggle({
      label: i18n.t('settings.fullscreen'),
      checked: this.settings.fullscreen,
      onChange: (checked) => this.settings.fullscreen = checked
    });
    group.appendChild(this.createSettingItem(fullscreen.create()));

    // FOV
    const fovItem = this.createSliderSetting(
      i18n.t('settings.fov'),
      this.settings.fov,
      60, 120,
      (value) => this.settings.fov = value
    );
    group.appendChild(fovItem);

    container.appendChild(group);
  }

  renderAudioSettings(container) {
    const group = this.createSettingsGroup(i18n.t('settings.audio'));

    // Master Volume
    const masterVol = this.createSliderSetting(
      i18n.t('settings.master_volume'),
      this.settings.masterVolume,
      0, 100,
      (value) => this.settings.masterVolume = value
    );
    group.appendChild(masterVol);

    // Music Volume
    const musicVol = this.createSliderSetting(
      i18n.t('settings.music_volume'),
      this.settings.musicVolume,
      0, 100,
      (value) => this.settings.musicVolume = value
    );
    group.appendChild(musicVol);

    // SFX Volume
    const sfxVol = this.createSliderSetting(
      i18n.t('settings.sfx_volume'),
      this.settings.sfxVolume,
      0, 100,
      (value) => this.settings.sfxVolume = value
    );
    group.appendChild(sfxVol);

    container.appendChild(group);
  }

  renderControlsSettings(container) {
    const group = this.createSettingsGroup(i18n.t('settings.controls'));

    // Mouse Sensitivity
    const mouseSens = this.createSliderSetting(
      i18n.t('settings.mouse_sensitivity'),
      this.settings.mouseSensitivity,
      1, 100,
      (value) => this.settings.mouseSensitivity = value
    );
    group.appendChild(mouseSens);

    // ADS Sensitivity
    const adsSens = this.createSliderSetting(
      i18n.t('settings.ads_sensitivity'),
      this.settings.adsSensitivity,
      1, 100,
      (value) => this.settings.adsSensitivity = value
    );
    group.appendChild(adsSens);

    // Invert Y
    const invertY = new Toggle({
      label: i18n.t('settings.invert_y'),
      checked: this.settings.invertY,
      onChange: (checked) => this.settings.invertY = checked
    });
    group.appendChild(this.createSettingItem(invertY.create()));

    container.appendChild(group);
  }

  renderAccessibilitySettings(container) {
    const group = this.createSettingsGroup(i18n.t('settings.accessibility'));

    // Colorblind Mode
    const colorblind = new Dropdown({
      label: i18n.t('settings.colorblind_mode'),
      options: [
        { value: 'none', label: i18n.t('settings.colorblind_none') },
        { value: 'protanopia', label: i18n.t('settings.colorblind_protanopia') },
        { value: 'deuteranopia', label: i18n.t('settings.colorblind_deuteranopia') },
        { value: 'tritanopia', label: i18n.t('settings.colorblind_tritanopia') }
      ],
      value: this.settings.colorblindMode,
      onChange: (value) => {
        this.settings.colorblindMode = value;
        colorBlindModes.setMode(value);
      }
    });
    group.appendChild(this.createSettingItem(colorblind.create()));

    // High Contrast
    const highContrast = new Toggle({
      label: i18n.t('settings.high_contrast'),
      checked: this.settings.highContrast,
      onChange: (checked) => {
        this.settings.highContrast = checked;
        document.body.classList.toggle('high-contrast', checked);
      }
    });
    group.appendChild(this.createSettingItem(highContrast.create()));

    // Text Scale
    const textScale = new Dropdown({
      label: i18n.t('settings.text_scale'),
      options: [
        { value: 'small', label: 'Small' },
        { value: 'normal', label: 'Normal' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' }
      ],
      value: this.settings.textScale,
      onChange: (value) => {
        this.settings.textScale = value;
        document.body.className = document.body.className.replace(/text-scale-\w+/g, '');
        document.body.classList.add(`text-scale-${value}`);
      }
    });
    group.appendChild(this.createSettingItem(textScale.create()));

    // Reduced Motion
    const reducedMotion = new Toggle({
      label: i18n.t('settings.reduced_motion'),
      checked: this.settings.reducedMotion,
      onChange: (checked) => {
        this.settings.reducedMotion = checked;
        document.body.classList.toggle('reduced-motion', checked);
      }
    });
    group.appendChild(this.createSettingItem(reducedMotion.create()));

    container.appendChild(group);
  }

  createSettingsGroup(title) {
    const group = document.createElement('div');
    group.className = 'settings-group';

    const titleEl = document.createElement('h3');
    titleEl.className = 'settings-group-title';
    titleEl.textContent = title;
    group.appendChild(titleEl);

    return group;
  }

  createSettingItem(control) {
    const item = document.createElement('div');
    item.className = 'settings-item';
    item.appendChild(control);
    return item;
  }

  createSliderSetting(label, value, min, max, onChange) {
    const item = document.createElement('div');
    item.className = 'settings-item';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'settings-item-label';

    const titleEl = document.createElement('div');
    titleEl.className = 'settings-item-title';
    titleEl.textContent = label;
    labelDiv.appendChild(titleEl);

    const control = document.createElement('div');
    control.className = 'settings-item-control';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.style.flex = '1';

    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = value;
    valueDisplay.style.minWidth = '40px';
    valueDisplay.style.textAlign = 'right';

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      valueDisplay.textContent = val;
      onChange(val);
    });

    control.appendChild(slider);
    control.appendChild(valueDisplay);

    item.appendChild(labelDiv);
    item.appendChild(control);

    return item;
  }

  saveSettings() {
    // Save to localStorage
    localStorage.setItem('game-settings', JSON.stringify(this.settings));
    
    // Dispatch settings change event
    window.dispatchEvent(new CustomEvent('settings:changed', {
      detail: { settings: this.settings }
    }));

    Toast.success('Settings saved successfully');
    
    if (this.onClose) {
      this.onClose();
    }
  }

  loadSettings() {
    const saved = localStorage.getItem('game-settings');
    if (saved) {
      try {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }

  show() {
    if (this.element) {
      this.loadSettings();
      this.element.classList.remove('hidden');
      this.renderSection(this.currentSection);
    }
  }

  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
