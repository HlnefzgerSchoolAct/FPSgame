/**
 * ProtocolClient - Client-side message encoding/decoding
 * Mirrors server protocol for browser use
 */

import { pack, unpack } from 'msgpackr/pack';

// Message type enumeration (must match server)
export const MessageType = {
  // Client -> Server
  JOIN: 0,
  INPUT: 1,
  FIRE: 2,
  HIT_CONFIRM: 3,
  SHOP_PURCHASE: 4,
  EQUIP_LOADOUT: 5,
  HEARTBEAT: 6,
  
  // Server -> Client
  JOINED: 100,
  SNAPSHOT: 101,
  EVENT: 102,
  RECONCILE: 103,
  SHOP_INVENTORY: 104,
  ECONOMY_UPDATE: 105,
  ERROR: 106,
};

// Event types
export const EventType = {
  KILL: 0,
  DEATH: 1,
  HIT: 2,
  SCORE: 3,
  OBJECTIVE: 4,
  INVENTORY: 5,
  PURCHASE_OK: 6,
  PURCHASE_FAIL: 7,
  RANK_CHANGE: 8,
};

// Action flags
export const ActionFlags = {
  JUMP: 1 << 0,
  CROUCH: 1 << 1,
  SPRINT: 1 << 2,
  ADS: 1 << 3,
  RELOAD: 1 << 4,
  SWITCH_WEAPON: 1 << 5,
  USE: 1 << 6,
  MELEE: 1 << 7,
};

/**
 * Encode message to binary
 */
export function encodeMessage(type, payload) {
  const message = {
    t: type,
    p: payload,
    ts: Date.now()
  };
  return pack(message);
}

/**
 * Decode binary message
 */
export function decodeMessage(data) {
  try {
    const message = unpack(new Uint8Array(data));
    return {
      type: message.t,
      payload: message.p,
      timestamp: message.ts
    };
  } catch (error) {
    console.error('Failed to decode message:', error);
    return null;
  }
}

/**
 * Create action bitmask from flags
 */
export function createActionMask(flags) {
  let mask = 0;
  if (flags.jump) mask |= ActionFlags.JUMP;
  if (flags.crouch) mask |= ActionFlags.CROUCH;
  if (flags.sprint) mask |= ActionFlags.SPRINT;
  if (flags.ads) mask |= ActionFlags.ADS;
  if (flags.reload) mask |= ActionFlags.RELOAD;
  if (flags.switchWeapon) mask |= ActionFlags.SWITCH_WEAPON;
  if (flags.use) mask |= ActionFlags.USE;
  if (flags.melee) mask |= ActionFlags.MELEE;
  return mask;
}

/**
 * Parse action bitmask to flags
 */
export function parseActionMask(mask) {
  return {
    jump: (mask & ActionFlags.JUMP) !== 0,
    crouch: (mask & ActionFlags.CROUCH) !== 0,
    sprint: (mask & ActionFlags.SPRINT) !== 0,
    ads: (mask & ActionFlags.ADS) !== 0,
    reload: (mask & ActionFlags.RELOAD) !== 0,
    switchWeapon: (mask & ActionFlags.SWITCH_WEAPON) !== 0,
    use: (mask & ActionFlags.USE) !== 0,
    melee: (mask & ActionFlags.MELEE) !== 0,
  };
}

// Message creators
export function createJoinMessage(sessionToken, desiredRegion = 'auto') {
  return encodeMessage(MessageType.JOIN, {
    token: sessionToken,
    region: desiredRegion
  });
}

export function createInputMessage(seq, dt, move, look, actions, weaponId, timestamp) {
  return encodeMessage(MessageType.INPUT, {
    seq,
    dt,
    move: { x: move.x, y: move.y, z: move.z },
    look: { x: look.x, y: look.y },
    actions,
    weaponId,
    ts: timestamp
  });
}

export function createFireMessage(seq, weaponState, timestamp) {
  return encodeMessage(MessageType.FIRE, {
    seq,
    weapon: weaponState,
    ts: timestamp
  });
}

export function createShopPurchaseMessage(itemId, currency, priceQuoted) {
  return encodeMessage(MessageType.SHOP_PURCHASE, {
    itemId,
    currency,
    price: priceQuoted
  });
}

export function createEquipLoadoutMessage(loadout) {
  return encodeMessage(MessageType.EQUIP_LOADOUT, {
    loadout
  });
}

export function createHeartbeatMessage(clientTime) {
  return encodeMessage(MessageType.HEARTBEAT, {
    clientTime
  });
}

export default {
  MessageType,
  EventType,
  ActionFlags,
  encodeMessage,
  decodeMessage,
  createActionMask,
  parseActionMask,
  createJoinMessage,
  createInputMessage,
  createFireMessage,
  createShopPurchaseMessage,
  createEquipLoadoutMessage,
  createHeartbeatMessage,
};
