function CharStats(charObj) {
  this.object = charObj;

  this.attackSpeedBase = undefined;
  this.attackSpeed = undefined;
}

CharStats.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['attackSpeedBase', 1, 999999],
    ['attackSpeed', 1, 999999]
  ]);
};

CharStats.prototype._getEquipData = function(equipIdx) {
  var itemData = GDM.getNow('item_data');
  var equipItemType = ITMPARTTOTYPE[equipIdx];
  var visPartIdx = ITMPARTTOVISPART[equipIdx];
  var item = this.object.visParts[visPartIdx];
  if (item.itemType === 0) {
    // Empty Slot
    return null;
  }
  return itemData.getData(equipItemType, item.itemNo);
};

CharStats.prototype.getAttackSpeed = function() {
  return this.attackSpeed / 10;
};

CharStats.prototype.getAttackDistance = function() {
  var weaponData = this._getEquipData(INVEQUIPIDX.WEAPON);
  if (!weaponData) {
    return DEFAULT_ATTACK_DISTANCE;
  }
  return weaponData[WEAPON_DATA.RANGE] / 100;
};

module.exports = CharStats;
