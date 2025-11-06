/**
 * AmmoHealth Component
 * Displays ammunition count and health/armor bars
 */

export class AmmoHealth {
  constructor() {
    this.element = null;
    this.currentAmmo = 30;
    this.reserveAmmo = 90;
    this.currentHealth = 100;
    this.maxHealth = 100;
    this.currentArmor = 0;
    this.maxArmor = 100;
    this.hasArmor = false;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'hud-vitals-ammo';

    // Health/Armor section
    const vitalsContainer = document.createElement('div');
    vitalsContainer.className = 'hud-vitals';

    // Health bar
    const healthContainer = document.createElement('div');
    healthContainer.className = 'vitals-container';
    
    const healthLabel = document.createElement('div');
    healthLabel.className = 'vitals-label';
    healthLabel.textContent = 'Health';
    healthContainer.appendChild(healthLabel);

    const healthBar = document.createElement('div');
    healthBar.className = 'vitals-bar health-bar';
    healthBar.id = 'health-bar';
    healthBar.setAttribute('role', 'progressbar');
    healthBar.setAttribute('aria-valuenow', this.currentHealth);
    healthBar.setAttribute('aria-valuemin', '0');
    healthBar.setAttribute('aria-valuemax', this.maxHealth);

    const healthFill = document.createElement('div');
    healthFill.className = 'vitals-fill';
    healthFill.id = 'health-fill';
    healthFill.style.width = '100%';

    const healthText = document.createElement('div');
    healthText.className = 'vitals-text';
    healthText.id = 'health-text';
    healthText.textContent = `${this.currentHealth}`;

    healthBar.appendChild(healthFill);
    healthBar.appendChild(healthText);
    healthContainer.appendChild(healthBar);
    vitalsContainer.appendChild(healthContainer);

    // Armor bar (if applicable)
    if (this.hasArmor) {
      const armorContainer = document.createElement('div');
      armorContainer.className = 'vitals-container';
      armorContainer.id = 'armor-container';
      armorContainer.style.marginTop = 'var(--space-sm)';
      
      const armorLabel = document.createElement('div');
      armorLabel.className = 'vitals-label';
      armorLabel.textContent = 'Armor';
      armorContainer.appendChild(armorLabel);

      const armorBar = document.createElement('div');
      armorBar.className = 'vitals-bar armor-bar';
      armorBar.id = 'armor-bar';

      const armorFill = document.createElement('div');
      armorFill.className = 'vitals-fill armor-fill';
      armorFill.id = 'armor-fill';
      armorFill.style.width = '0%';
      armorFill.style.background = 'var(--color-hud-armor)';

      const armorText = document.createElement('div');
      armorText.className = 'vitals-text';
      armorText.id = 'armor-text';
      armorText.textContent = '0';

      armorBar.appendChild(armorFill);
      armorBar.appendChild(armorText);
      armorContainer.appendChild(armorBar);
      vitalsContainer.appendChild(armorContainer);
    }

    // Ammo section
    const ammoContainer = document.createElement('div');
    ammoContainer.className = 'hud-ammo';

    const ammoDisplay = document.createElement('div');
    ammoDisplay.className = 'ammo-display';

    const ammoCurrent = document.createElement('span');
    ammoCurrent.className = 'ammo-current';
    ammoCurrent.id = 'ammo-current';
    ammoCurrent.textContent = this.currentAmmo;

    const ammoDivider = document.createElement('span');
    ammoDivider.className = 'ammo-divider';
    ammoDivider.textContent = '/';

    const ammoReserve = document.createElement('span');
    ammoReserve.className = 'ammo-reserve';
    ammoReserve.id = 'ammo-reserve';
    ammoReserve.textContent = this.reserveAmmo;

    ammoDisplay.appendChild(ammoCurrent);
    ammoDisplay.appendChild(ammoDivider);
    ammoDisplay.appendChild(ammoReserve);
    ammoContainer.appendChild(ammoDisplay);

    this.element.appendChild(vitalsContainer);
    this.element.appendChild(ammoContainer);

    return this.element;
  }

  updateAmmo(current, reserve) {
    this.currentAmmo = current;
    this.reserveAmmo = reserve;

    const currentEl = document.getElementById('ammo-current');
    const reserveEl = document.getElementById('ammo-reserve');

    if (currentEl) {
      currentEl.textContent = current;
      
      // Add low ammo warning
      if (current <= 5) {
        currentEl.classList.add('low');
      } else {
        currentEl.classList.remove('low');
      }
    }

    if (reserveEl) {
      reserveEl.textContent = reserve;
    }
  }

  updateHealth(current, max = this.maxHealth) {
    this.currentHealth = current;
    this.maxHealth = max;

    const healthBar = document.getElementById('health-bar');
    const healthFill = document.getElementById('health-fill');
    const healthText = document.getElementById('health-text');

    if (healthBar && healthFill && healthText) {
      const percentage = (current / max) * 100;
      healthFill.style.width = `${percentage}%`;
      healthText.textContent = `${Math.round(current)}`;
      healthBar.setAttribute('aria-valuenow', current);

      // Add low health class for visual warning
      if (percentage < 30) {
        healthBar.classList.add('low');
      } else {
        healthBar.classList.remove('low');
      }
    }
  }

  updateArmor(current, max = this.maxArmor) {
    this.currentArmor = current;
    this.maxArmor = max;
    this.hasArmor = current > 0;

    // Show/hide armor container
    const armorContainer = document.getElementById('armor-container');
    if (armorContainer) {
      armorContainer.style.display = this.hasArmor ? 'block' : 'none';
    }

    const armorFill = document.getElementById('armor-fill');
    const armorText = document.getElementById('armor-text');

    if (armorFill && armorText) {
      const percentage = (current / max) * 100;
      armorFill.style.width = `${percentage}%`;
      armorText.textContent = `${Math.round(current)}`;
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

// Event integration
export function setupAmmoHealthEvents(ammoHealth) {
  window.addEventListener('hud:update:ammo', (e) => {
    ammoHealth.updateAmmo(e.detail.current, e.detail.reserve);
  });

  window.addEventListener('hud:update:health', (e) => {
    ammoHealth.updateHealth(e.detail.health, e.detail.maxHealth);
  });

  window.addEventListener('hud:update:armor', (e) => {
    ammoHealth.updateArmor(e.detail.armor, e.detail.maxArmor);
  });
}
