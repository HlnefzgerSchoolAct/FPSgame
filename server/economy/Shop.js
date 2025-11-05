/**
 * Shop - Economy and shop system
 * Validates purchases, manages currencies, and handles inventory
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { playerDataStore } from '../persistence/PlayerData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ShopSystem {
  constructor() {
    this.shopInventory = null;
    this.prices = null;
    this.featuredRotation = [];
    this.dailyDeal = null;
    this.lastRotation = 0;
    
    this.loadShopData();
  }
  
  /**
   * Load shop data from JSON files
   */
  loadShopData() {
    try {
      const shopPath = join(__dirname, '../../data/economy/shop_inventory.json');
      const pricesPath = join(__dirname, '../../data/economy/prices.json');
      
      this.shopInventory = JSON.parse(readFileSync(shopPath, 'utf8'));
      this.prices = JSON.parse(readFileSync(pricesPath, 'utf8'));
      
      this.rotateShop();
      console.log('Shop data loaded successfully');
    } catch (error) {
      console.error('Failed to load shop data:', error);
      this.shopInventory = { weapon_skins: { categories: [] }, bundles: { items: [] } };
      this.prices = { cosmetic_pricing: {}, bundle_pricing: {} };
    }
  }
  
  /**
   * Rotate shop items (featured, daily deal)
   */
  rotateShop() {
    const now = Date.now();
    const rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - this.lastRotation < rotationInterval) {
      return;
    }
    
    this.lastRotation = now;
    
    // Rotate featured items
    const allItems = this.getAllItems();
    this.featuredRotation = this.selectRandomItems(allItems, 6);
    
    // Select daily deal
    this.dailyDeal = allItems[Math.floor(Math.random() * allItems.length)];
  }
  
  /**
   * Get all available items
   */
  getAllItems() {
    const items = [];
    
    // Weapon skins
    if (this.shopInventory.weapon_skins?.categories) {
      for (const category of this.shopInventory.weapon_skins.categories) {
        items.push(...category.items);
      }
    }
    
    // Operator skins
    if (this.shopInventory.operator_skins?.items) {
      items.push(...this.shopInventory.operator_skins.items);
    }
    
    // Accessories
    if (this.shopInventory.accessories) {
      const accessories = this.shopInventory.accessories;
      if (accessories.charms) items.push(...accessories.charms);
      if (accessories.sprays) items.push(...accessories.sprays);
      if (accessories.emblems) items.push(...accessories.emblems);
      if (accessories.emotes) items.push(...accessories.emotes);
    }
    
    return items;
  }
  
  /**
   * Select random items
   */
  selectRandomItems(items, count) {
    const selected = [];
    const available = [...items];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length);
      selected.push(available.splice(index, 1)[0]);
    }
    
    return selected;
  }
  
  /**
   * Get current shop rotation
   */
  getShopRotation() {
    this.rotateShop(); // Check if rotation needed
    
    return {
      featured: this.featuredRotation,
      dailyDeal: this.dailyDeal,
      bundles: this.shopInventory.bundles?.items || [],
      lastRotation: this.lastRotation,
    };
  }
  
  /**
   * Validate and process a purchase
   */
  processPurchase(playerId, itemId, currency, priceQuoted) {
    const player = playerDataStore.getPlayer(playerId);
    const item = this.findItem(itemId);
    
    if (!item) {
      return {
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      };
    }
    
    // Check if already owned
    const itemType = this.getItemType(item);
    if (playerDataStore.ownsItem(playerId, itemType, itemId)) {
      return {
        success: false,
        error: 'Item already owned',
        code: 'ALREADY_OWNED'
      };
    }
    
    // Validate price
    const actualPrice = this.getItemPrice(item, currency);
    if (actualPrice === null) {
      return {
        success: false,
        error: 'Item not available for this currency',
        code: 'INVALID_CURRENCY'
      };
    }
    
    // Allow for slight price variations (daily deals, etc.)
    if (Math.abs(actualPrice - priceQuoted) > actualPrice * 0.1) {
      return {
        success: false,
        error: 'Price mismatch',
        code: 'PRICE_MISMATCH',
        actualPrice
      };
    }
    
    // Check funds
    const playerCurrency = currency === 'credits' 
      ? player.currencies.credits 
      : player.currencies.gems;
      
    if (playerCurrency < priceQuoted) {
      return {
        success: false,
        error: 'Insufficient funds',
        code: 'INSUFFICIENT_FUNDS',
        required: priceQuoted,
        available: playerCurrency
      };
    }
    
    // Process purchase
    const costDelta = currency === 'credits' ? -priceQuoted : 0;
    const gemsDelta = currency === 'gems' ? -priceQuoted : 0;
    
    playerDataStore.updateCurrencies(playerId, costDelta, gemsDelta);
    playerDataStore.addToInventory(playerId, itemType, itemId);
    
    console.log(`Purchase: Player ${playerId} bought ${itemId} for ${priceQuoted} ${currency}`);
    
    return {
      success: true,
      item,
      price: priceQuoted,
      currency,
      newBalance: playerDataStore.getPlayer(playerId).currencies
    };
  }
  
  /**
   * Find item by ID
   */
  findItem(itemId) {
    const allItems = this.getAllItems();
    return allItems.find(item => item.id === itemId);
  }
  
  /**
   * Get item type for inventory categorization
   */
  getItemType(item) {
    if (item.id.startsWith('skin_')) {
      if (item.id.includes('operator')) return 'operators';
      return 'skins';
    }
    if (item.id.startsWith('charm_')) return 'charms';
    if (item.id.startsWith('emote_')) return 'emotes';
    if (item.id.startsWith('spray_')) return 'sprays';
    if (item.id.startsWith('emblem_')) return 'emblems';
    return 'items';
  }
  
  /**
   * Get item price for specified currency
   */
  getItemPrice(item, currency) {
    if (currency === 'credits' && item.price_credits) {
      return item.price_credits;
    }
    if (currency === 'gems' && item.price_gems) {
      return item.price_gems;
    }
    return null;
  }
  
  /**
   * Process bundle purchase
   */
  processBundlePurchase(playerId, bundleId) {
    const bundle = this.shopInventory.bundles?.items?.find(b => b.id === bundleId);
    
    if (!bundle) {
      return {
        success: false,
        error: 'Bundle not found',
        code: 'BUNDLE_NOT_FOUND'
      };
    }
    
    const player = playerDataStore.getPlayer(playerId);
    const price = bundle.price_gems;
    
    if (player.currencies.gems < price) {
      return {
        success: false,
        error: 'Insufficient gems',
        code: 'INSUFFICIENT_FUNDS'
      };
    }
    
    // Deduct cost
    playerDataStore.updateCurrencies(playerId, 0, -price);
    
    // Add all bundle items
    for (const itemId of bundle.contents) {
      if (itemId.startsWith('credits_')) {
        const amount = parseInt(itemId.split('_')[1]);
        playerDataStore.updateCurrencies(playerId, amount, 0);
      } else {
        const item = this.findItem(itemId);
        if (item) {
          const itemType = this.getItemType(item);
          playerDataStore.addToInventory(playerId, itemType, itemId);
        }
      }
    }
    
    return {
      success: true,
      bundle,
      newBalance: playerDataStore.getPlayer(playerId).currencies
    };
  }
}

// Singleton instance
export const shopSystem = new ShopSystem();
