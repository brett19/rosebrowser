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

var ITEMTYPE = {
  FACE_ITEM: 1,
  HELMET: 2,
  ARMOR: 3,
  ARMS: 4,
  BOOTS: 5,
  BACK: 6,
  JEWEL: 7,
  WEAPON: 8,
  SHIELD: 9,
  USE: 10,
  ETC: 11,
  GEM: 11,
  NATURAL: 12,
  QUEST: 13,
  RIDE_PART: 14,
  MOUNT: 15,
  MAX: 16
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

InventoryData.prototype.findByLocSlot = function(location, slotNo) {
  for (var i = 0; i < this.items.length; ++i) {
    var item = this.items[i];
    if (item.location === location && item.slotNo === slotNo) {
      return item;
    }
  }
  return null;
};
