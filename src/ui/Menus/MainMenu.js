/**
 * MainMenu Component
 * Main navigation menu
 */

import { Button } from '../Components/Button.js';
import { i18n } from '../LocalizationManager.js';

export class MainMenu {
  constructor(options = {}) {
    const {
      onPlay = null,
      onLoadouts = null,
      onShop = null,
      onBattlePass = null,
      onSettings = null,
      onQuit = null
    } = options;

    this.onPlay = onPlay;
    this.onLoadouts = onLoadouts;
    this.onShop = onShop;
    this.onBattlePass = onBattlePass;
    this.onSettings = onSettings;
    this.onQuit = onQuit;
    this.element = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'menu-container main-menu';
    this.element.id = 'main-menu';
    this.element.setAttribute('role', 'navigation');
    this.element.setAttribute('aria-label', 'Main menu');

    const content = document.createElement('div');
    content.className = 'menu-content';

    // Logo
    const logo = document.createElement('h1');
    logo.className = 'menu-logo';
    logo.textContent = i18n.t('menu.main_title');

    const subtitle = document.createElement('p');
    subtitle.className = 'menu-subtitle';
    subtitle.textContent = i18n.t('menu.subtitle');

    // Navigation buttons
    const nav = document.createElement('nav');
    nav.className = 'menu-nav';

    const playButton = new Button({
      label: i18n.t('menu.play'),
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => {
        if (this.onPlay) this.onPlay();
      }
    });

    const loadoutsButton = new Button({
      label: i18n.t('menu.loadouts'),
      variant: 'secondary',
      size: 'large',
      fullWidth: true,
      onClick: () => {
        if (this.onLoadouts) this.onLoadouts();
      }
    });

    const shopButton = new Button({
      label: i18n.t('menu.shop'),
      variant: 'secondary',
      size: 'large',
      fullWidth: true,
      onClick: () => {
        if (this.onShop) this.onShop();
      }
    });

    const battlePassButton = new Button({
      label: i18n.t('menu.battle_pass'),
      variant: 'secondary',
      size: 'large',
      fullWidth: true,
      onClick: () => {
        if (this.onBattlePass) this.onBattlePass();
      }
    });

    const settingsButton = new Button({
      label: i18n.t('menu.settings'),
      variant: 'ghost',
      size: 'large',
      fullWidth: true,
      onClick: () => {
        if (this.onSettings) this.onSettings();
      }
    });

    nav.appendChild(playButton.create());
    nav.appendChild(loadoutsButton.create());
    nav.appendChild(shopButton.create());
    nav.appendChild(battlePassButton.create());
    nav.appendChild(settingsButton.create());

    content.appendChild(logo);
    content.appendChild(subtitle);
    content.appendChild(nav);
    this.element.appendChild(content);

    return this.element;
  }

  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      // Focus first button for keyboard navigation
      setTimeout(() => {
        const firstButton = this.element.querySelector('button');
        if (firstButton) firstButton.focus();
      }, 100);
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
