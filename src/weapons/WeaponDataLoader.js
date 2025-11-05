/**
 * WeaponDataLoader - Loads and merges weapon and attachment data
 */
export class WeaponDataLoader {
  constructor() {
    this.weapons = new Map();
    this.attachments = new Map();
    this.recoilPatterns = new Map();
    this.loaded = false;
  }
  
  async loadAll() {
    try {
      const [weaponsData, attachmentsData, recoilData] = await Promise.all([
        fetch('/data/weapons/weapons.json').then(r => r.json()),
        fetch('/data/weapons/attachments.json').then(r => r.json()),
        fetch('/balance/recoil_patterns.json').then(r => r.json())
      ]);
      
      // Store weapons
      weaponsData.weapons.forEach(weapon => {
        this.weapons.set(weapon.id, weapon);
      });
      
      // Store attachments by slot
      if (attachmentsData.attachments) {
        Object.entries(attachmentsData.attachments).forEach(([slot, items]) => {
          items.forEach(attachment => {
            this.attachments.set(attachment.id, { ...attachment, slot });
          });
        });
      }
      
      // Store recoil patterns
      if (recoilData.patterns) {
        Object.entries(recoilData.patterns).forEach(([id, pattern]) => {
          this.recoilPatterns.set(id, pattern);
        });
      }
      
      this.loaded = true;
      console.log(`Loaded ${this.weapons.size} weapons, ${this.attachments.size} attachments, ${this.recoilPatterns.size} recoil patterns`);
      
      return true;
    } catch (error) {
      console.error('Failed to load weapon data:', error);
      return false;
    }
  }
  
  getWeapon(weaponId) {
    return this.weapons.get(weaponId);
  }
  
  getAttachment(attachmentId) {
    return this.attachments.get(attachmentId);
  }
  
  getRecoilPattern(patternId) {
    return this.recoilPatterns.get(patternId);
  }
  
  getWeaponWithAttachments(weaponId, equippedAttachments = {}) {
    const baseWeapon = this.getWeapon(weaponId);
    if (!baseWeapon) return null;
    
    // Clone weapon stats
    const weapon = JSON.parse(JSON.stringify(baseWeapon));
    
    // Apply attachment modifications
    // Order: base weapon -> attachments deltas
    Object.entries(equippedAttachments).forEach(([slot, attachmentId]) => {
      if (!attachmentId) return;
      
      const attachment = this.getAttachment(attachmentId);
      if (!attachment) return;
      
      // Check compatibility
      if (attachment.compatible_roles && 
          !attachment.compatible_roles.includes(weapon.role)) {
        console.warn(`Attachment ${attachmentId} not compatible with ${weapon.role}`);
        return;
      }
      
      // Apply stat modifications
      this._applyAttachmentStats(weapon.stats, attachment.stats);
    });
    
    return weapon;
  }
  
  _applyAttachmentStats(weaponStats, attachmentStats) {
    Object.entries(attachmentStats).forEach(([key, value]) => {
      if (key.endsWith('_mult')) {
        // Multiplicative modifier
        const baseStat = key.replace('_mult', '');
        if (weaponStats[baseStat] !== undefined) {
          weaponStats[baseStat] *= value;
        }
        // Also handle nested stats like falloff
        if (baseStat === 'falloff_range' && weaponStats.falloff) {
          weaponStats.falloff = weaponStats.falloff.map(f => ({
            ...f,
            range: f.range * value
          }));
        }
      } else if (typeof value === 'number' && !key.endsWith('_mult')) {
        // Additive modifier
        if (weaponStats[key] !== undefined) {
          weaponStats[key] += value;
        }
      } else {
        // Direct assignment (e.g., for non-numeric values)
        weaponStats[key] = value;
      }
    });
  }
  
  getAllWeapons() {
    return Array.from(this.weapons.values());
  }
  
  getWeaponsByRole(role) {
    return Array.from(this.weapons.values()).filter(w => w.role === role);
  }
  
  getAttachmentsForSlot(slot, weaponRole = null) {
    return Array.from(this.attachments.values()).filter(a => {
      if (a.slot !== slot) return false;
      if (weaponRole && a.compatible_roles && 
          !a.compatible_roles.includes(weaponRole)) return false;
      return true;
    });
  }
}
