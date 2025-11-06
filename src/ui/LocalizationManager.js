/**
 * LocalizationManager
 * Handles loading and accessing localized strings
 */

export class LocalizationManager {
  constructor() {
    this.currentLocale = 'en-US';
    this.translations = {};
    this.fallbackLocale = 'en-US';
  }

  async loadLocale(locale) {
    try {
      const response = await fetch(`/src/localization/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale}`);
      }
      const data = await response.json();
      this.translations[locale] = data;
      this.currentLocale = locale;
      return true;
    } catch (error) {
      console.error(`Error loading locale ${locale}:`, error);
      return false;
    }
  }

  async init(locale = 'en-US') {
    await this.loadLocale(locale);
    if (locale !== this.fallbackLocale) {
      await this.loadLocale(this.fallbackLocale);
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLocale];
    
    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English if translation not found
    if (value === undefined && this.currentLocale !== this.fallbackLocale) {
      value = this.translations[this.fallbackLocale];
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
    }

    // If still not found, return the key
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Replace parameters
    if (typeof value === 'string') {
      return this.interpolate(value, params);
    }

    return value;
  }

  interpolate(str, params) {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  getCurrentLocale() {
    return this.currentLocale;
  }

  async setLocale(locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
      this.dispatchLocaleChange();
      return true;
    }
    
    const loaded = await this.loadLocale(locale);
    if (loaded) {
      this.currentLocale = locale;
      this.dispatchLocaleChange();
    }
    return loaded;
  }

  dispatchLocaleChange() {
    window.dispatchEvent(new CustomEvent('locale:changed', {
      detail: { locale: this.currentLocale }
    }));
  }
}

// Global instance
export const i18n = new LocalizationManager();
