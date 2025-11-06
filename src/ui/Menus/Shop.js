/**
 * Shop Component
 * In-game shop for cosmetics and items
 */

import { Modal } from '../Components/Modal.js';
import { Button } from '../Components/Button.js';
import { Toast } from '../Components/Toast.js';
import { i18n } from '../LocalizationManager.js';

export class Shop {
  constructor(options = {}) {
    const {
      onPurchase = null,
      onClose = null
    } = options;

    this.onPurchase = onPurchase;
    this.onClose = onClose;
    this.element = null;
    this.currentSection = 'featured';
    this.credits = 0;
    this.gems = 0;
    this.inventory = [];
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'menu-container shop-container';
    this.element.id = 'shop-menu';

    // Header with currencies
    const header = document.createElement('div');
    header.className = 'shop-header';

    const title = document.createElement('h1');
    title.textContent = i18n.t('shop.title');
    header.appendChild(title);

    const currencies = document.createElement('div');
    currencies.className = 'shop-currencies';

    // Credits
    const creditsDisplay = this.createCurrencyDisplay('credits', this.credits);
    currencies.appendChild(creditsDisplay);

    // Gems
    const gemsDisplay = this.createCurrencyDisplay('gems', this.gems);
    currencies.appendChild(gemsDisplay);

    header.appendChild(currencies);
    this.element.appendChild(header);

    // Section tabs
    const sections = document.createElement('div');
    sections.className = 'shop-sections';

    const sectionNames = ['featured', 'weapon_skins', 'operator_skins', 'accessories', 'bundles'];
    sectionNames.forEach(section => {
      const tab = document.createElement('button');
      tab.className = 'shop-section-tab';
      if (section === this.currentSection) tab.classList.add('active');
      tab.textContent = i18n.t(`shop.${section}`);
      tab.addEventListener('click', () => this.switchSection(section));
      sections.appendChild(tab);
    });

    this.element.appendChild(sections);

    // Items grid
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'shop-items-grid';
    itemsGrid.id = 'shop-items-grid';
    this.element.appendChild(itemsGrid);

    // Back button
    const backButton = new Button({
      label: i18n.t('common.back'),
      variant: 'ghost',
      onClick: () => {
        if (this.onClose) this.onClose();
      }
    });
    this.element.appendChild(backButton.create());

    return this.element;
  }

  createCurrencyDisplay(type, amount) {
    const display = document.createElement('div');
    display.className = 'currency-display';

    const icon = document.createElement('div');
    icon.className = `currency-icon ${type}`;
    icon.textContent = type === 'credits' ? 'C' : 'G';

    const amountEl = document.createElement('div');
    amountEl.className = 'currency-amount';
    amountEl.id = `currency-${type}`;
    amountEl.textContent = amount.toLocaleString();

    display.appendChild(icon);
    display.appendChild(amountEl);
    return display;
  }

  switchSection(section) {
    this.currentSection = section;

    // Update active tab
    const tabs = this.element.querySelectorAll('.shop-section-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent === i18n.t(`shop.${section}`)) {
        tab.classList.add('active');
      }
    });

    // Load items for section
    this.loadItems(section);
  }

  async loadItems(section) {
    const grid = document.getElementById('shop-items-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading...</div>';

    // In a real implementation, this would fetch from the server
    // For now, we'll use mock data
    setTimeout(() => {
      grid.innerHTML = '';
      // Add mock items
      for (let i = 0; i < 6; i++) {
        const item = this.createShopItem({
          id: `item-${i}`,
          name: `Item ${i + 1}`,
          rarity: ['common', 'rare', 'epic', 'legendary'][i % 4],
          price: (i + 1) * 1000,
          currency: i % 2 === 0 ? 'credits' : 'gems',
          owned: false
        });
        grid.appendChild(item);
      }
    }, 300);
  }

  createShopItem(itemData) {
    const card = document.createElement('div');
    card.className = 'shop-item-card';

    const preview = document.createElement('div');
    preview.className = 'shop-item-preview';

    const rarity = document.createElement('div');
    rarity.className = `shop-item-rarity ${itemData.rarity}`;
    rarity.textContent = i18n.t(`shop.rarity_${itemData.rarity}`);
    preview.appendChild(rarity);

    const details = document.createElement('div');
    details.className = 'shop-item-details';

    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = itemData.name;
    details.appendChild(name);

    const description = document.createElement('div');
    description.className = 'shop-item-description';
    description.textContent = 'Description of the item';
    details.appendChild(description);

    const priceContainer = document.createElement('div');
    priceContainer.className = 'shop-item-price';

    const price = document.createElement('div');
    price.className = 'price-amount';
    price.innerHTML = `<span class="currency-icon ${itemData.currency}">${itemData.currency === 'credits' ? 'C' : 'G'}</span> ${itemData.price.toLocaleString()}`;
    priceContainer.appendChild(price);

    const buyButton = new Button({
      label: itemData.owned ? i18n.t('shop.owned') : i18n.t('shop.purchase'),
      variant: itemData.owned ? 'ghost' : 'primary',
      disabled: itemData.owned,
      size: 'small',
      onClick: () => this.handlePurchase(itemData)
    });
    priceContainer.appendChild(buyButton.create());

    details.appendChild(priceContainer);

    card.appendChild(preview);
    card.appendChild(details);

    return card;
  }

  handlePurchase(item) {
    // Check if player has enough currency
    const currency = item.currency === 'credits' ? this.credits : this.gems;
    if (currency < item.price) {
      Toast.error(i18n.t('shop.insufficient_funds', { currency: item.currency }));
      return;
    }

    // Show confirmation modal
    const modal = new Modal({
      title: i18n.t('shop.purchase_confirm'),
      content: `Purchase ${item.name} for ${item.price} ${item.currency}?`,
      onClose: () => modal.destroy()
    });

    const modalContent = modal.create().querySelector('.modal-content');
    
    const confirmButton = new Button({
      label: i18n.t('common.confirm'),
      variant: 'primary',
      onClick: () => {
        this.completePurchase(item);
        modal.close();
      }
    });

    const cancelButton = new Button({
      label: i18n.t('common.cancel'),
      variant: 'secondary',
      onClick: () => modal.close()
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = 'var(--space-md)';
    buttonContainer.style.marginTop = 'var(--space-lg)';
    buttonContainer.appendChild(confirmButton.create());
    buttonContainer.appendChild(cancelButton.create());
    
    modalContent.appendChild(buttonContainer);
    modal.open();
  }

  completePurchase(item) {
    if (this.onPurchase) {
      this.onPurchase(item);
    }

    // Update currency
    if (item.currency === 'credits') {
      this.updateCredits(this.credits - item.price);
    } else {
      this.updateGems(this.gems - item.price);
    }

    Toast.success(i18n.t('shop.purchase_success'));
    
    // Reload items to show as owned
    this.loadItems(this.currentSection);
  }

  updateCredits(amount) {
    this.credits = amount;
    const el = document.getElementById('currency-credits');
    if (el) {
      el.textContent = amount.toLocaleString();
    }
  }

  updateGems(amount) {
    this.gems = amount;
    const el = document.getElementById('currency-gems');
    if (el) {
      el.textContent = amount.toLocaleString();
    }
  }

  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.loadItems(this.currentSection);
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
