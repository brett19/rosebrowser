'use strict';

var ITEMLOC = {
  GROUND: 0,
  INVENTORY: 1,
  EQUIPPED_EQUIP: 2,
  EQUIPPED_AMMO: 3,
  EQUIPPED_COSTUME: 4,
  EQUIPPED_PAT: 5,
  STORAGE_ACCOUNT: 6,
  STORAGE_PREMIUM: 7,
  STORAGE_CHARACTER: 8,
  STORAGE_ITEMMALL: 9,
  ITEMMALL_PURCHASES: 10,
  WISH_LIST: 11,
  ALL: 12,
  QUEST: 13
};

var INVEQUIPIDX = {
  FACE_ITEM: 1,
  HELMET: 2,
  ARMOR: 3,
  BACK: 4,
  ARMS: 5,
  BOOTS: 6,
  WEAPON: 7,
  SHIELD: 8,
  NECKLACE: 9,
  RING: 10,
  EARRING: 11,
  MAX: 12
};

function InventoryData() {
  this.items = [];
  this.money = new Int64();
}

InventoryData.fromPacketData = function(itemData) {
  var inv = new InventoryData();
  inv.items = itemData.items;
  inv.money = itemData.money;
  return inv;
};
