'use strict';

// This class must provide at least all the methods available on CharStats.

function McStats(mcObj) {
  this.object = mcObj;

  this.str = undefined;
  this.dex = undefined;
  this.int = undefined;
  this.con = undefined;
  this.cha = undefined;
  this.sen = undefined;
}

McStats.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['str', 0, 5000],
    ['dex', 0, 5000],
    ['int', 0, 5000],
    ['con', 0, 5000],
    ['cha', 0, 5000],
    ['sen', 0, 5000]
  ]);
};

McStats.prototype._getEquipData = function(equipIdx) {
  var itemData = GDM.getNow('item_data');
  var item = this.object.inventory.findByLocSlot(ITEMLOC.EQUIPPED_EQUIP, equipIdx);
  if (!item) {
    // Empty Slot
    return null;
  }
  var equipItemType = ITMPARTTOTYPE[equipIdx];
  if (item.itemType !== equipItemType) {
    console.warn('Item found in incorret equipment slot.');
    return null;
  }
  return itemData.getData(item.itemType, item.itemNo);
};

McStats.prototype.getMaxHp = function() {
  return 12338;
};

McStats.prototype.getMaxMp = function() {
  return 12338;
};

McStats.prototype.getAttackSpeed = function() {
  // TODO: Implement this properly!
  return 100;
};

McStats.prototype.getAttackDistance = function() {
  var weaponData = this._getEquipData(INVEQUIPIDX.WEAPON);
  if (!weaponData) {
    return DEFAULT_ATTACK_DISTANCE;
  }
  return weaponData[WEAPON_DATA.RANGE] / 100;
};

McStats.getNeedRawExp = function () {
  var level = this.object.level;
  if (level <= 15) {
    return Math.floor((level + 3) * (level + 5) * (level + 10) * 0.7);
  } else if (level <= 50) {
    return Math.floor((level - 5) * (level + 2) * (level + 2) * 2.2);
  } else if (level <= 100) {
    return Math.floor((level - 5) * (level + 2) * (level - 38) * 9.0);
  } else if (level <= 139) {
    return Math.floor((level + 27) * (level + 34) * (level + 220) * 1.0);
  } else {
    return Math.floor((level - 15) * (level + 7) * (level - 126) * 41.0);
  }
};
