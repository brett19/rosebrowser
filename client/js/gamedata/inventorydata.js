var EventEmitter = require('../util/eventemitter');

global.ITEMLOC = {
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

global.INVEQUIPIDX = {
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

global.VISEQUIPIDX = {
  FACE: 0,
  HAIR: 1,
  HELMET: 2,
  ARMOR: 3,
  ARMS: 4,
  BOOTS: 5,
  FACE_ITEM: 6,
  BACK: 7,
  WEAPON: 8,
  SHIELD: 9
};

global.ITEMTYPE = {
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
  MAX: 16,
  MONEY: 31
};

global.ITEM_DATA = {
  STANDARD_PRICE: 5
};

global.WEAPON_DATA = {
  RANGE: 33
};

global.ITMPARTTOVISPART = {};
ITMPARTTOVISPART[INVEQUIPIDX.HELMET] = VISEQUIPIDX.HELMET;
ITMPARTTOVISPART[INVEQUIPIDX.ARMOR] = VISEQUIPIDX.ARMOR;
ITMPARTTOVISPART[INVEQUIPIDX.ARMS] = VISEQUIPIDX.ARMS;
ITMPARTTOVISPART[INVEQUIPIDX.BOOTS] = VISEQUIPIDX.BOOTS;
ITMPARTTOVISPART[INVEQUIPIDX.FACE_ITEM] = VISEQUIPIDX.FACE_ITEM;
ITMPARTTOVISPART[INVEQUIPIDX.BACK] = VISEQUIPIDX.BACK;
ITMPARTTOVISPART[INVEQUIPIDX.WEAPON] = VISEQUIPIDX.WEAPON;
ITMPARTTOVISPART[INVEQUIPIDX.SHIELD] = VISEQUIPIDX.SHIELD;

global.ITMPARTTOTYPE = {};
ITMPARTTOTYPE[INVEQUIPIDX.FACE_ITEM] = ITEMTYPE.FACE_ITEM;
ITMPARTTOTYPE[INVEQUIPIDX.HELMET] = ITEMTYPE.HELMET;
ITMPARTTOTYPE[INVEQUIPIDX.ARMOR] = ITEMTYPE.ARMOR;
ITMPARTTOTYPE[INVEQUIPIDX.BACK] = ITEMTYPE.BACK;
ITMPARTTOTYPE[INVEQUIPIDX.ARMS] = ITEMTYPE.ARMS;
ITMPARTTOTYPE[INVEQUIPIDX.BOOTS] = ITEMTYPE.BOOTS;
ITMPARTTOTYPE[INVEQUIPIDX.WEAPON] = ITEMTYPE.WEAPON;
ITMPARTTOTYPE[INVEQUIPIDX.SHIELD] = ITEMTYPE.SHIELD;
ITMPARTTOTYPE[INVEQUIPIDX.NECKLACE] = ITEMTYPE.NECKLACE;
ITMPARTTOTYPE[INVEQUIPIDX.RING] = ITEMTYPE.RING;
ITMPARTTOTYPE[INVEQUIPIDX.EARRING] = ITEMTYPE.EARRING;

global.ITMTYPETOPART = {};
ITMTYPETOPART[ITEMTYPE.FACE_ITEM] = INVEQUIPIDX.FACE_ITEM;
ITMTYPETOPART[ITEMTYPE.HELMET] = INVEQUIPIDX.HELMET;
ITMTYPETOPART[ITEMTYPE.ARMOR] = INVEQUIPIDX.ARMOR;
ITMTYPETOPART[ITEMTYPE.BACK] = INVEQUIPIDX.BACK;
ITMTYPETOPART[ITEMTYPE.ARMS] = INVEQUIPIDX.ARMS;
ITMTYPETOPART[ITEMTYPE.BOOTS] = INVEQUIPIDX.BOOTS;
ITMTYPETOPART[ITEMTYPE.WEAPON] = INVEQUIPIDX.WEAPON;
ITMTYPETOPART[ITEMTYPE.SHIELD] = INVEQUIPIDX.SHIELD;
ITMTYPETOPART[ITEMTYPE.NECKLACE] = INVEQUIPIDX.NECKLACE;
ITMTYPETOPART[ITEMTYPE.RING] = INVEQUIPIDX.RING;
ITMTYPETOPART[ITEMTYPE.EARRING] = INVEQUIPIDX.EARRING;

global.ITMSTACKABLE = {};
ITMSTACKABLE[ITEMTYPE.USE] = true;
ITMSTACKABLE[ITEMTYPE.ETC] = true;
ITMSTACKABLE[ITEMTYPE.NATURAL] = true;
ITMSTACKABLE[ITEMTYPE.QUEST] = true;

var InventoryData = function() {
  EventEmitter.call(this);
  this.items = [];
  this.money = new Int64();
};

InventoryData.prototype = Object.create(EventEmitter.prototype);

InventoryData.prototype.setMoney = function(money) {
  this.money = money;
  this.emit('changed', money);
};

InventoryData.prototype.setItems = function(items) {
  this.items = items;
  this.emit('changed');
};

InventoryData.prototype.addItem = function(item) {
  if (item.itemType === ITEMTYPE.MONEY) {
    this.money = item.quantity;
    this.emit('changed', this.money);
  } else {
    var isNewItem = true;

    for (var i = 0; i < this.items.length; ++i) {
      var other = this.items[i];
      if (other.location === item.location && other.slotNo === item.slotNo) {
        this.items[i] = item;
        isNewItem = false;
      }
    }

    if (isNewItem) {
      this.items.push(item);
    }

    this.emit('changed', [item]);
  }
};

InventoryData.prototype.changeItems = function(changeItems) {
  for (var i = 0; i < changeItems.length; ++i) {
    var changeItem = changeItems[i];

    for (var j = 0; j < this.items.length; ++j) {
      var item = this.items[j]

      if (item.itemKey.lo === changeItem.itemKey.lo &&
          item.itemKey.hi === changeItem.itemKey.hi) {
        this.items[j] = changeItem.item;
      }
    }
  }

  this.emit('changed', changeItems);
};

InventoryData.prototype.appendItems = function(items) {
  this.items = this.items.concat(items);
  this.emit('changed', items);
};

InventoryData.prototype.useItem = function(item) {
  if (item.location === ITEMLOC.EQUIPPED_EQUIP) {
    netGame.equipItem(item.slotNo, 0);
  } else if (item.location === ITEMLOC.INVENTORY) {
    if (ITMTYPETOPART[item.itemType]) {
      netGame.equipItem(ITMTYPETOPART[item.itemType], item.itemKey);
    } else if (item.itemType === ITEMTYPE.USE) {
      // TODO: Use consumable on TARGET / POSITION
      netGame.useItem(item.itemKey);
    } else if (item.itemType === ITEMTYPE.RIDE_PART) {
      // TODO: Equip ride part
    }else if (item.itemType === ITEMTYPE.MOUNT) {
      netGame.toggleMount(item.itemKey);
    }
  }
};

InventoryData.prototype.dropItem = function(item) {
  ui.messageBox('Are you sure you want to drop item?', ['Yes', 'No'])
    .on('yes', function(answer) {
      console.warn('TODO: Unimplemented dropItem', srcItem);
    })
    .on('no', function() {
    });
};

InventoryData.prototype.findByItemKey = function(itemKey) {
  for (var i = 0; i < this.items.length; ++i) {
    var item = this.items[i];

    if (item.itemKey.lo === itemKey.lo &&
        item.itemKey.hi === itemKey.hi) {
      return item;
    }
  }

  return null;
};

InventoryData.prototype.findBySlot = function(slotNo) {
  if (slotNo < INVEQUIPIDX.MAX) {
    return this.findByLocSlot(ITEMLOC.EQUIPPED_EQUIP, slotNo);
  } else if (slotNo < INVEQUIPIDX.MAX + 120) {
    return this.findByLocSlot(ITEMLOC.INVENTORY, slotNo - INVEQUIPIDX.MAX);
  } else if (slotNo < INVEQUIPIDX.MAX + 120 + 3) {
    return this.findByLocSlot(ITEMLOC.EQUIPPED_AMMO, slotNo - INVEQUIPIDX.MAX - 120);
  } else if (slotNo < INVEQUIPIDX.MAX + 120 + 3 + 5) {
    return this.findByLocSlot(ITEMLOC.EQUIPPED_PAT, slotNo - INVEQUIPIDX.MAX - 120 - 3);
  } else {
    throw new Error('Find by slot ' + slotNo);
  }
};


InventoryData.prototype.getSlotFromLocSlot = function(location, slotNo) {
  if (location === ITEMLOC.EQUIPPED_EQUIP) {
    return slotNo;
  } else if (location === ITEMLOC.INVENTORY) {
    return slotNo + INVEQUIPIDX.MAX;
  } else if (location === ITEMLOC.EQUIPPED_AMMO) {
    return slotNo + INVEQUIPIDX.MAX + 120;
  } else if (location === ITEMLOC.EQUIPPED_PAT) {
    return slotNo + INVEQUIPIDX.MAX + 120 + 3;
  }else {
    throw new Error('getSlotFromLocSlot ' + location + ' ' + slotNo);
  }
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

module.exports = InventoryData;
