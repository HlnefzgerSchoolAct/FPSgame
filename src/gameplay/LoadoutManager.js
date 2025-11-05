/**
 * LoadoutManager - Equip/unequip weapons, apply attachment stat mods
 */
export class LoadoutManager {
  constructor(weaponDataLoader) {
    this.weaponDataLoader = weaponDataLoader;
    
    // Loadout slots
    this.slots = {
      primary: null,
      secondary: null,
      melee: null,
      tactical: null,
      lethal: null
    };
    
    // Equipped attachments per weapon
    this.attachments = {
      primary: {},
      secondary: {}
    };
    
    // Allowed slots based on weapon type
    this.allowedAttachmentSlots = ['barrel', 'sight', 'underbarrel', 'magazine', 'stock'];
    
    this.currentSlot = 'primary';
  }
  
  /**
   * Equip a weapon to a slot
   * @param {String} slot - 'primary', 'secondary', etc.
   * @param {String} weaponId - Weapon ID from weapons.json
   * @returns {Boolean} Success
   */
  equipWeapon(slot, weaponId) {
    if (!this.slots.hasOwnProperty(slot)) {
      console.error(`Invalid slot: ${slot}`);
      return false;
    }
    
    const weapon = this.weaponDataLoader.getWeapon(weaponId);
    if (!weapon) {
      console.error(`Weapon not found: ${weaponId}`);
      return false;
    }
    
    this.slots[slot] = weaponId;
    
    // Initialize attachments for this slot if not exists
    if (!this.attachments[slot]) {
      this.attachments[slot] = {};
    }
    
    console.log(`Equipped ${weapon.name} to ${slot}`);
    return true;
  }
  
  /**
   * Unequip a weapon from a slot
   * @param {String} slot - Slot to clear
   */
  unequipWeapon(slot) {
    if (this.slots[slot]) {
      console.log(`Unequipped ${this.slots[slot]} from ${slot}`);
      this.slots[slot] = null;
      this.attachments[slot] = {};
    }
  }
  
  /**
   * Attach an attachment to a weapon
   * @param {String} weaponSlot - 'primary' or 'secondary'
   * @param {String} attachmentSlot - 'barrel', 'sight', etc.
   * @param {String} attachmentId - Attachment ID
   * @returns {Boolean} Success
   */
  attachAttachment(weaponSlot, attachmentSlot, attachmentId) {
    if (!this.slots[weaponSlot]) {
      console.error(`No weapon in slot: ${weaponSlot}`);
      return false;
    }
    
    if (!this.allowedAttachmentSlots.includes(attachmentSlot)) {
      console.error(`Invalid attachment slot: ${attachmentSlot}`);
      return false;
    }
    
    const attachment = this.weaponDataLoader.getAttachment(attachmentId);
    if (!attachment) {
      console.error(`Attachment not found: ${attachmentId}`);
      return false;
    }
    
    // Check if attachment is compatible with weapon
    const weapon = this.weaponDataLoader.getWeapon(this.slots[weaponSlot]);
    if (attachment.compatible_roles && 
        !attachment.compatible_roles.includes(weapon.role)) {
      console.error(`Attachment ${attachmentId} not compatible with ${weapon.role}`);
      return false;
    }
    
    // Check unlock requirement
    if (attachment.unlock_requirement && attachment.unlock_requirement.weapon_level) {
      // This would be checked against player's weapon progression
      // For now, we'll allow all attachments
    }
    
    this.attachments[weaponSlot][attachmentSlot] = attachmentId;
    console.log(`Attached ${attachment.name} to ${weaponSlot} ${attachmentSlot}`);
    
    return true;
  }
  
  /**
   * Remove an attachment from a weapon
   * @param {String} weaponSlot - 'primary' or 'secondary'
   * @param {String} attachmentSlot - Slot to clear
   */
  removeAttachment(weaponSlot, attachmentSlot) {
    if (this.attachments[weaponSlot] && this.attachments[weaponSlot][attachmentSlot]) {
      delete this.attachments[weaponSlot][attachmentSlot];
      console.log(`Removed attachment from ${weaponSlot} ${attachmentSlot}`);
    }
  }
  
  /**
   * Get complete weapon data with attachments applied
   * @param {String} slot - Weapon slot
   * @returns {Object|null} Weapon data with attachment mods applied
   */
  getEquippedWeapon(slot) {
    const weaponId = this.slots[slot];
    if (!weaponId) return null;
    
    const attachments = this.attachments[slot] || {};
    return this.weaponDataLoader.getWeaponWithAttachments(weaponId, attachments);
  }
  
  /**
   * Get current weapon
   */
  getCurrentWeapon() {
    return this.getEquippedWeapon(this.currentSlot);
  }
  
  /**
   * Switch to a different weapon slot
   * @param {String} slot - Slot to switch to
   */
  switchToSlot(slot) {
    if (this.slots[slot]) {
      this.currentSlot = slot;
      
      window.dispatchEvent(new CustomEvent('input:switch', {
        detail: { slot, weaponId: this.slots[slot] }
      }));
      
      return true;
    }
    return false;
  }
  
  /**
   * Switch to next weapon
   */
  switchToNext() {
    const slotOrder = ['primary', 'secondary'];
    const currentIndex = slotOrder.indexOf(this.currentSlot);
    
    for (let i = 1; i <= slotOrder.length; i++) {
      const nextIndex = (currentIndex + i) % slotOrder.length;
      const nextSlot = slotOrder[nextIndex];
      
      if (this.slots[nextSlot]) {
        return this.switchToSlot(nextSlot);
      }
    }
    
    return false;
  }
  
  /**
   * Get loadout state for serialization
   */
  getLoadout() {
    return {
      slots: { ...this.slots },
      attachments: JSON.parse(JSON.stringify(this.attachments)),
      currentSlot: this.currentSlot
    };
  }
  
  /**
   * Set loadout from serialized state
   */
  setLoadout(loadout) {
    this.slots = { ...loadout.slots };
    this.attachments = JSON.parse(JSON.stringify(loadout.attachments));
    this.currentSlot = loadout.currentSlot;
  }
  
  /**
   * Validate loadout (ensure all weapons/attachments exist)
   */
  validateLoadout() {
    let valid = true;
    
    // Check weapons
    Object.entries(this.slots).forEach(([slot, weaponId]) => {
      if (weaponId && !this.weaponDataLoader.getWeapon(weaponId)) {
        console.error(`Invalid weapon in ${slot}: ${weaponId}`);
        this.slots[slot] = null;
        valid = false;
      }
    });
    
    // Check attachments
    Object.entries(this.attachments).forEach(([weaponSlot, attachmentSlots]) => {
      Object.entries(attachmentSlots).forEach(([slot, attachmentId]) => {
        if (attachmentId && !this.weaponDataLoader.getAttachment(attachmentId)) {
          console.error(`Invalid attachment: ${attachmentId}`);
          delete this.attachments[weaponSlot][slot];
          valid = false;
        }
      });
    });
    
    return valid;
  }
}
