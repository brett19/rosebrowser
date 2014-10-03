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

McStats.prototype.getMaxHp = function() { return 12337; };
McStats.prototype.getMaxMp = function() { return 12337; };

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
