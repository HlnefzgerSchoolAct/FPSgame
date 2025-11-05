/**
 * Schema - Binary message protocol using MessagePack
 * Defines all message types and their structures for client-server communication
 */

import { pack, unpack } from 'msgpackr';

// Message type enumeration
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

// Event types for EVENT message
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

/**
 * Encode a message to binary format
 * @param {number} type - Message type from MessageType enum
 * @param {Object} payload - Message payload
 * @returns {Buffer} - Encoded binary data
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
 * Decode a binary message
 * @param {Buffer|ArrayBuffer} data - Binary message data
 * @returns {Object} - Decoded message with type and payload
 */
export function decodeMessage(data) {
  try {
    const message = unpack(data);
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
 * Create a JOIN message (Client -> Server)
 */
export function createJoinMessage(sessionToken, desiredRegion = 'auto') {
  return encodeMessage(MessageType.JOIN, {
    token: sessionToken,
    region: desiredRegion
  });
}

/**
 * Create an INPUT message (Client -> Server)
 */
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

/**
 * Create a FIRE message (Client -> Server)
 */
export function createFireMessage(seq, weaponState, timestamp) {
  return encodeMessage(MessageType.FIRE, {
    seq,
    weapon: weaponState,
    ts: timestamp
  });
}

/**
 * Create a HIT_CONFIRM message (Client -> Server)
 */
export function createHitConfirmMessage(localHitId) {
  return encodeMessage(MessageType.HIT_CONFIRM, {
    hitId: localHitId
  });
}

/**
 * Create a SHOP_PURCHASE message (Client -> Server)
 */
export function createShopPurchaseMessage(itemId, currency, priceQuoted) {
  return encodeMessage(MessageType.SHOP_PURCHASE, {
    itemId,
    currency,
    price: priceQuoted
  });
}

/**
 * Create an EQUIP_LOADOUT message (Client -> Server)
 */
export function createEquipLoadoutMessage(loadout) {
  return encodeMessage(MessageType.EQUIP_LOADOUT, {
    loadout
  });
}

/**
 * Create a HEARTBEAT message (Client -> Server)
 */
export function createHeartbeatMessage(clientTime) {
  return encodeMessage(MessageType.HEARTBEAT, {
    clientTime
  });
}

/**
 * Create a JOINED response (Server -> Client)
 */
export function createJoinedMessage(playerId, roomId, matchConfig) {
  return encodeMessage(MessageType.JOINED, {
    playerId,
    roomId,
    config: matchConfig
  });
}

/**
 * Create a SNAPSHOT message (Server -> Client)
 */
export function createSnapshotMessage(serverTick, players, projectiles, objectives, yourState, ackSeq) {
  return encodeMessage(MessageType.SNAPSHOT, {
    tick: serverTick,
    players,
    projectiles,
    objectives,
    you: yourState,
    ack: ackSeq
  });
}

/**
 * Create an EVENT message (Server -> Client)
 */
export function createEventMessage(eventType, payload) {
  return encodeMessage(MessageType.EVENT, {
    type: eventType,
    data: payload
  });
}

/**
 * Create a RECONCILE message (Server -> Client)
 */
export function createReconcileMessage(serverTick, stateForYou) {
  return encodeMessage(MessageType.RECONCILE, {
    tick: serverTick,
    state: stateForYou
  });
}

/**
 * Create a SHOP_INVENTORY message (Server -> Client)
 */
export function createShopInventoryMessage(rotation, prices) {
  return encodeMessage(MessageType.SHOP_INVENTORY, {
    rotation,
    prices
  });
}

/**
 * Create an ECONOMY_UPDATE message (Server -> Client)
 */
export function createEconomyUpdateMessage(currencies, inventory) {
  return encodeMessage(MessageType.ECONOMY_UPDATE, {
    currencies,
    inventory
  });
}

/**
 * Create an ERROR message (Server -> Client)
 */
export function createErrorMessage(code, message) {
  return encodeMessage(MessageType.ERROR, {
    code,
    msg: message
  });
}

// Action bitmask constants for input actions
export const ActionFlags = {
  JUMP: 1 << 0,        // 0x01
  CROUCH: 1 << 1,      // 0x02
  SPRINT: 1 << 2,      // 0x04
  ADS: 1 << 3,         // 0x08
  RELOAD: 1 << 4,      // 0x10
  SWITCH_WEAPON: 1 << 5, // 0x20
  USE: 1 << 6,         // 0x40
  MELEE: 1 << 7,       // 0x80
};

/**
 * Create action bitmask from boolean flags
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
 * Parse action bitmask to boolean flags
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

// Validation helpers
export const Validation = {
  // Maximum message size (1MB)
  MAX_MESSAGE_SIZE: 1024 * 1024,
  
  // Rate limits (messages per second)
  INPUT_RATE_LIMIT: 60,
  FIRE_RATE_LIMIT: 30,
  GENERAL_RATE_LIMIT: 120,
  
  // Heartbeat interval
  HEARTBEAT_INTERVAL_MS: 1000,
  HEARTBEAT_TIMEOUT_MS: 5000,
  
  // Movement validation
  MAX_MOVE_SPEED: 15.0, // units per second
  MAX_LOOK_SPEED: Math.PI * 4, // radians per second
  
  // Weapon validation
  MAX_AMMO: 999,
  MIN_FIRE_INTERVAL_MS: 33, // ~30 shots per second max
};

export default {
  MessageType,
  EventType,
  ActionFlags,
  Validation,
  encodeMessage,
  decodeMessage,
  createJoinMessage,
  createInputMessage,
  createFireMessage,
  createHitConfirmMessage,
  createShopPurchaseMessage,
  createEquipLoadoutMessage,
  createHeartbeatMessage,
  createJoinedMessage,
  createSnapshotMessage,
  createEventMessage,
  createReconcileMessage,
  createShopInventoryMessage,
  createEconomyUpdateMessage,
  createErrorMessage,
  createActionMask,
  parseActionMask,
};
