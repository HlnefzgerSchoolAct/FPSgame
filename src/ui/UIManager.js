/**
 * UIManager
 * Central manager for all UI components and state
 */

import { i18n } from './LocalizationManager.js';
import { MainMenu } from './Menus/MainMenu.js';
import { Shop } from './Menus/Shop.js';
import { Settings } from './Menus/Settings.js';
import { Crosshair, setupCrosshairEvents } from './HUD/Crosshair.js';
import { AmmoHealth, setupAmmoHealthEvents } from './HUD/AmmoHealth.js';
import { KillFeed, setupKillFeedEvents } from './HUD/KillFeed.js';
import { Timer, setupTimerEvents } from './HUD/Timer.js';
import { Toast } from './Components/Toast.js';
import { colorBlindModes } from './Accessibility/ColorBlindModes.js';
import { screenReader } from './Accessibility/ScreenReaderAnnouncer.js';
import { focusManager } from './Accessibility/FocusManager.js';

export class UIManager {
  constructor() {
    this.currentMenu = null;
    this.hudVisible = false;
    this.initialized = false;
    
    // Components
    this.mainMenu = null;
    this.shop = null;
    this.settings = null;
    this.crosshair = null;
    this.ammoHealth = null;
    this.killFeed = null;
    this.timer = null;
    
    // Containers
    this.hudContainer = null;
    this.menuContainer = null;
  }

  async init() {
    if (this.initialized) return;

    // Load localization
    await i18n.init('en-US');

    // Initialize accessibility features
    screenReader.create();
    focusManager.init();
    colorBlindModes.init();

    // Create containers
    this.createContainers();

    // Initialize HUD components
    this.initHUD();

    // Initialize menus
    this.initMenus();

    // Load CSS
    this.loadStyles();

    this.initialized = true;
    console.log('UIManager initialized');
  }

  createContainers() {
    // HUD container
    this.hudContainer = document.createElement('div');
    this.hudContainer.id = 'hud';
    this.hudContainer.className = 'hud-container';
    this.hudContainer.style.display = 'none';
    document.body.appendChild(this.hudContainer);

    // Menu container wrapper
    this.menuContainer = document.createElement('div');
    this.menuContainer.id = 'menu-wrapper';
    this.menuContainer.className = 'menu-wrapper';
    document.body.appendChild(this.menuContainer);
  }

  loadStyles() {
    // Link all CSS files
    const stylesheets = [
      '/src/ui/Styles/base.css',
      '/src/ui/Styles/theme.css',
      '/src/ui/Styles/hud.css',
      '/src/ui/Styles/menus.css',
      '/src/ui/Styles/responsive.css',
      '/src/ui/Styles/accessibility.css'
    ];

    stylesheets.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });

    // Add component styles inline
    this.injectComponentStyles();
  }

  injectComponentStyles() {
    // This would include styles from components
    // For now, styles are in separate CSS files
  }

  initHUD() {
    // Crosshair
    this.crosshair = new Crosshair({
      style: 'cross',
      dynamicSpread: true
    });
    this.hudContainer.appendChild(this.crosshair.create());
    setupCrosshairEvents(this.crosshair);

    // Ammo and Health
    this.ammoHealth = new AmmoHealth();
    this.hudContainer.appendChild(this.ammoHealth.create());
    setupAmmoHealthEvents(this.ammoHealth);

    // Kill Feed
    this.killFeed = new KillFeed();
    this.hudContainer.appendChild(this.killFeed.create());
    setupKillFeedEvents(this.killFeed);

    // Timer
    this.timer = new Timer();
    this.hudContainer.appendChild(this.timer.create());
    setupTimerEvents(this.timer);
  }

  initMenus() {
    // Main Menu
    this.mainMenu = new MainMenu({
      onPlay: () => this.startGame(),
      onLoadouts: () => this.showLoadouts(),
      onShop: () => this.showShop(),
      onBattlePass: () => this.showBattlePass(),
      onSettings: () => this.showSettings()
    });
    
    const mainMenuEl = this.mainMenu.create();
    this.menuContainer.appendChild(mainMenuEl);
    this.currentMenu = this.mainMenu;

    // Shop
    this.shop = new Shop({
      onPurchase: (item) => this.handlePurchase(item),
      onClose: () => this.showMainMenu()
    });
    const shopEl = this.shop.create();
    shopEl.classList.add('hidden');
    this.menuContainer.appendChild(shopEl);

    // Settings
    this.settings = new Settings({
      onClose: () => this.showMainMenu()
    });
    const settingsEl = this.settings.create();
    settingsEl.classList.add('hidden');
    this.menuContainer.appendChild(settingsEl);
  }

  showHUD() {
    this.hudVisible = true;
    if (this.hudContainer) {
      this.hudContainer.style.display = 'block';
    }
    screenReader.announce(i18n.t('accessibility.match_start'));
  }

  hideHUD() {
    this.hudVisible = false;
    if (this.hudContainer) {
      this.hudContainer.style.display = 'none';
    }
  }

  showMainMenu() {
    this.hideAllMenus();
    if (this.mainMenu) {
      this.mainMenu.show();
      this.currentMenu = this.mainMenu;
    }
  }

  showShop() {
    this.hideAllMenus();
    if (this.shop) {
      this.shop.show();
      this.currentMenu = this.shop;
      screenReader.announce('Shop opened');
    }
  }

  showLoadouts() {
    Toast.info('Loadouts menu coming soon');
  }

  showBattlePass() {
    Toast.info('Battle Pass menu coming soon');
  }

  showSettings() {
    this.hideAllMenus();
    if (this.settings) {
      this.settings.show();
      this.currentMenu = this.settings;
      screenReader.announce('Settings opened');
    }
  }

  hideAllMenus() {
    if (this.mainMenu) this.mainMenu.hide();
    if (this.shop) this.shop.hide();
    if (this.settings) this.settings.hide();
  }

  startGame() {
    this.hideAllMenus();
    this.showHUD();
    
    // Dispatch event for game to start
    window.dispatchEvent(new CustomEvent('ui:start_game'));
    screenReader.announce('Starting game');
  }

  handlePurchase(item) {
    // Dispatch purchase event for game logic to handle
    window.dispatchEvent(new CustomEvent('shop:purchase', {
      detail: { item }
    }));
  }

  // Analytics hooks
  trackEvent(eventName, data = {}) {
    window.dispatchEvent(new CustomEvent('analytics:track', {
      detail: { event: eventName, data }
    }));
  }

  // Public API for game to update HUD
  updateAmmo(current, reserve) {
    if (this.ammoHealth) {
      this.ammoHealth.updateAmmo(current, reserve);
    }
  }

  updateHealth(health, maxHealth = 100) {
    if (this.ammoHealth) {
      this.ammoHealth.updateHealth(health, maxHealth);
    }
  }

  updateArmor(armor, maxArmor = 100) {
    if (this.ammoHealth) {
      this.ammoHealth.updateArmor(armor, maxArmor);
    }
  }

  updateCrosshairSpread(spread) {
    if (this.crosshair) {
      this.crosshair.updateSpread(spread);
    }
  }

  addKillFeedEntry(killer, victim, weapon, isHeadshot = false) {
    if (this.killFeed) {
      this.killFeed.addKill(killer, victim, weapon, isHeadshot);
    }
  }

  updateTimer(seconds) {
    if (this.timer) {
      this.timer.setTime(seconds);
    }
  }

  showToast(message, type = 'info') {
    Toast.show(message, type);
  }
}

// Global instance
export const uiManager = new UIManager();
