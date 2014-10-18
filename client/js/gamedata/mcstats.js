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
  var iA = 10, iM1 = 8, fC = 2.25;
  var job = this.object.job;
  var level = this.object.level;

  switch(job) {
    case 111: iA=15; fC=3.50; iM1=12; break;
    case 121: iA=20; fC=5.00; iM1=20; break;
    case 122: iA=15; fC=4.00; iM1=18; break;

    case 211: iA=8; fC=3.25; iM1=10; break;
    case 221: iA=8; fC=3.50; iM1=15; break;
    case 222: iA=8; fC=3.75; iM1=17; break;

    case 311: iA=10; fC=3.00; iM1=10; break;
    case 321: iA=15; fC=3.25; iM1=18; break;
    case 322: iA=12; fC=3.00; iM1=16; break;

    case 411: iA=12; fC=3.00; iM1=10; break;
    case 421: iA=13; fC=4.00; iM1=19; break;
    case 422: iA=15; fC=3.75; iM1=16; break;

    case 411: iA=12; fC=3.00; iM1=10; break;
    case 421: iA=13; fC=4.00; iM1=19; break;
    case 422: iA=15; fC=3.75; iM1=17; break;

    default: iA=10; fC=2.25; iM1=8; break;
  }

  return Math.floor((level + iA) * Math.sqrt(level + iM1) * fC + (this.str * fC));
};

McStats.prototype.getMaxMp = function() {
  var iA = 5, fM1 = 3.0, fM2 = 2.0;
  var job = this.object.job;
  var level = this.object.level;

  switch (job) {
    case 111: iA=10; fM1=3.0; fM2=2.50; break;
    case 121: iA=10; fM1=3.5; fM2=3.25; break;
    case 122: iA=10; fM1=4.0; fM2=2.75; break;

    case 211: iA=20; fM1=8.0; fM2=4.00; break;
    case 221: iA=20; fM1=10.0; fM2=5.00; break;
    case 222: iA=20; fM1=9.0; fM2=5.00; break;

    case 311: iA=15; fM1=4.0; fM2=2.50; break;
    case 321: iA=15; fM1=5.0; fM2=2.75; break;
    case 322: iA=15; fM1=6.0; fM2=3.25; break;

    case 411: iA=12; fM1=5.0; fM2=2.75; break;
    case 421: iA=12; fM1=6.0; fM2=3.25; break;
    case 422: iA=12; fM1=6.0; fM2=3.75; break;

    default: iA=5; fM1=3.0; fM2=2.0; break;
  }

  return Math.floor((level + iA) * fM1 + (this.int * fM2));
};

McStats.prototype.getCritical = function() {
  var level = this.object.level;
  var baseValue = 190 + (level * 10);

  return Math.floor(this.sen + this.con * 0.2);
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

McStats.prototype.getNeedRawExp = function () {
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

module.exports = McStats;
