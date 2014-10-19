global.STATUS = {
  EFFECT: 10
};

global.ING = {
  NULL: 0,
  PROC: 1,
  INC_HP: 1,
  INC_MP: 2,
  POISONED: 3,

  INC_MAX_HP: 4,
  INC_MAX_MP: 5,

  CHECK_START: 6,
  INC_MOV_SPEED: 6,
  DEC_MOV_SPEED: 7,
  INC_ATK_SPEED: 8,
  DEC_ATK_SPEED: 9,
  INC_APOWER: 10,
  DEC_APOWER: 11,
  INC_DPOWER: 12,
  DEC_DPOWER: 13,
  INC_RES: 14,
  DEC_RES: 15,
  INC_HIT: 16,
  DEC_HIT: 17,
  INC_CRITICAL: 18,
  DEC_CRITICAL: 19,
  INC_AVOID: 20,
  DEC_AVOID: 21,
  DUMB: 22,
  SLEEP: 23,
  FAINTING: 24,
  DISGUISE: 25,
  TRANSPARENT: 26,
  SHIELD_DAMAGE: 27,
  ENHANCED_DAMAGE: 28,
  CHECK_END: 28,

  DEC_LIFE_TIME: 29,

  CLEAR_GOOD: 30,
  CLEAR_BAD: 31,
  CLEAR_ALL: 32,
  CLEAR_INVISIBLE: 33,

  TAUNT: 34,
  REVIVE: 35,
  CLEAR_RANDOM_GOOD: 36,
  CLEAR_RANDOM_BAD: 37,

  BASE_BUFFS_BEGIN: 38,
  INC_STR: 38,
  DEC_STR: 39,
  INC_DEX: 40,
  DEC_DEX: 41,
  INC_INT: 42,
  DEC_INT: 43,
  INC_CON: 44,
  DEC_CON: 45,
  INC_CHA: 46,
  DEC_CHA: 47,
  INC_SEN: 48,
  DEC_SEN: 49,
  INC_ALL_BASE: 50,
  DEC_ALL_BASE: 51,
  BASE_BUFFS_END: 51,

  ENHANCED_DAMAGE_REDUC: 52,
  MAGIC_SHIELD: 53,

  ANTI_INVISIBILITY: 60,
  NO_MOUNTDRIVING: 61,
  INVULNERABLE: 62,
  BASE_ATTRIBUTE: 63,
  DEF_ATTRIBUTE: 64,
  ATK_ATTRIBUTE: 65,

  MAX: 66
};

global.FLAG_ING = {
  INC_HP: Int64.fromBit(0),
  INC_MP: Int64.fromBit(1),
  POISONED: Int64.fromBit(2),

  INVULNERABLE: Int64.fromBit(3),

  MAX_HP: Int64.fromBit(4),
  MAX_MP: Int64.fromBit(5),
  INC_MOV_SPEED: Int64.fromBit(6),
  DEC_MOV_SPEED: Int64.fromBit(7),
  INC_ATK_SPEED: Int64.fromBit(8),
  DEC_ATK_SPEED: Int64.fromBit(9),
  INC_APOWER: Int64.fromBit(10),
  DEC_APOWER: Int64.fromBit(11),
  INC_DPOWER: Int64.fromBit(12),
  DEC_DPOWER: Int64.fromBit(13),
  INC_RES: Int64.fromBit(14),
  DEC_RES: Int64.fromBit(15),
  INC_HIT: Int64.fromBit(16),
  DEC_HIT: Int64.fromBit(17),
  INC_CRITICAL: Int64.fromBit(18),
  DEC_CRITICAL: Int64.fromBit(19),
  INC_AVOID: Int64.fromBit(20),
  DEC_AVOID: Int64.fromBit(21),
  DUMB: Int64.fromBit(22),
  SLEEP: Int64.fromBit(23),
  FAINTING: Int64.fromBit(24),
  DISGUISE: Int64.fromBit(25),
  TRANSPARENT: Int64.fromBit(26),
  SHIELD_DAMAGE: Int64.fromBit(27),
  ENHANCED_DAMAGE: Int64.fromBit(28),

  DEC_LIFE_TIME: Int64.fromBit(29),
  REVIVE: Int64.fromBit(30),
  TAUNT: Int64.fromBit(31),

  INC_STR: Int64.fromBit(32),
  DEC_STR: Int64.fromBit(33),
  INC_DEX: Int64.fromBit(34),
  DEC_DEX: Int64.fromBit(35),
  INC_INT: Int64.fromBit(36),
  DEC_INT: Int64.fromBit(37),
  INC_CON: Int64.fromBit(38),
  DEC_CON: Int64.fromBit(39),
  INC_CHA: Int64.fromBit(40),
  DEC_CHA: Int64.fromBit(41),
  INC_SEN: Int64.fromBit(42),
  DEC_SEN: Int64.fromBit(43),

  INC_ALL_BASE: Int64.fromBit(44),
  DEC_ALL_BASE: Int64.fromBit(45),

  ENHANCED_DAMAGE_REDUC: Int64.fromBit(46),
  MAGIC_SHIELD: Int64.fromBit(47),

  BASE_ATTRIBUTE: Int64.fromBit(48),
  DEF_ATTRIBUTE: Int64.fromBit(49),
  ATK_ATTRIBUTE: Int64.fromBit(50)
};

global.FLAG_ING_SUB = {
  HIDE:       Int64.fromBit(1),
  STORE:      Int64.fromBit(2),
  CHAT:       Int64.fromBit(4),
  ARUA_FAIRY: Int64.fromBit(30)
};

global.FLAG_ING_TO_ING = {};
FLAG_ING_TO_ING[FLAG_ING.INC_HP] = ING.INC_HP;
FLAG_ING_TO_ING[FLAG_ING.INC_MP] = ING.INC_MP;
FLAG_ING_TO_ING[FLAG_ING.POISONED] = ING.POISONED;

FLAG_ING_TO_ING[FLAG_ING.MAX_HP] = ING.MAX_HP;
FLAG_ING_TO_ING[FLAG_ING.MAX_MP] = ING.MAX_MP;

FLAG_ING_TO_ING[FLAG_ING.INC_MOV_SPEED] = ING.INC_MOV_SPEED;
FLAG_ING_TO_ING[FLAG_ING.DEC_MOV_SPEED] = ING.DEC_MOV_SPEED;
FLAG_ING_TO_ING[FLAG_ING.INC_ATK_SPEED] = ING.INC_ATK_SPEED;
FLAG_ING_TO_ING[FLAG_ING.DEC_ATK_SPEED] = ING.DEC_ATK_SPEED;
FLAG_ING_TO_ING[FLAG_ING.INC_APOWER] = ING.INC_APOWER;
FLAG_ING_TO_ING[FLAG_ING.DEC_APOWER] = ING.DEC_APOWER;
FLAG_ING_TO_ING[FLAG_ING.INC_DPOWER] = ING.INC_DPOWER;
FLAG_ING_TO_ING[FLAG_ING.DEC_DPOWER] = ING.DEC_DPOWER;
FLAG_ING_TO_ING[FLAG_ING.INC_RES] = ING.INC_RES;
FLAG_ING_TO_ING[FLAG_ING.DEC_RES] = ING.DEC_RES;
FLAG_ING_TO_ING[FLAG_ING.INC_HIT] = ING.INC_HIT;
FLAG_ING_TO_ING[FLAG_ING.DEC_HIT] = ING.DEC_HIT;
FLAG_ING_TO_ING[FLAG_ING.INC_CRITICAL] = ING.INC_CRITICAL;
FLAG_ING_TO_ING[FLAG_ING.DEC_CRITICAL] = ING.DEC_CRITICAL;
FLAG_ING_TO_ING[FLAG_ING.INC_AVOID] = ING.INC_AVOID;
FLAG_ING_TO_ING[FLAG_ING.DEC_AVOID] = ING.DEC_AVOID;
FLAG_ING_TO_ING[FLAG_ING.DUMB] = ING.DUMB;
FLAG_ING_TO_ING[FLAG_ING.SLEEP] = ING.SLEEP;
FLAG_ING_TO_ING[FLAG_ING.FAINTING] = ING.FAINTING;
FLAG_ING_TO_ING[FLAG_ING.DISGUISE] = ING.DISGUISE;
FLAG_ING_TO_ING[FLAG_ING.TRANSPARENT] = ING.TRANSPARENT;
FLAG_ING_TO_ING[FLAG_ING.SHIELD_DAMAGE] = ING.SHIELD_DAMAGE;
FLAG_ING_TO_ING[FLAG_ING.ENHANCED_DAMAGE] = ING.ENHANCED_DAMAGE;

FLAG_ING_TO_ING[FLAG_ING.DEC_LIFE_TIME] = ING.DEC_LIFE_TIME;

FLAG_ING_TO_ING[FLAG_ING.REVIVE] = ING.REVIVE;
FLAG_ING_TO_ING[FLAG_ING.TAUNT] = ING.TAUNT;

FLAG_ING_TO_ING[FLAG_ING.INC_STR] = ING.INC_STR;
FLAG_ING_TO_ING[FLAG_ING.DEC_STR] = ING.DEC_STR;
FLAG_ING_TO_ING[FLAG_ING.INC_DEX] = ING.INC_DEX;
FLAG_ING_TO_ING[FLAG_ING.DEC_DEX] = ING.DEC_DEX;
FLAG_ING_TO_ING[FLAG_ING.INC_INT] = ING.INC_INT;
FLAG_ING_TO_ING[FLAG_ING.DEC_INT] = ING.DEC_INT;
FLAG_ING_TO_ING[FLAG_ING.INC_CON] = ING.INC_CON;
FLAG_ING_TO_ING[FLAG_ING.DEC_CON] = ING.DEC_CON;
FLAG_ING_TO_ING[FLAG_ING.INC_CHA] = ING.INC_CHA;
FLAG_ING_TO_ING[FLAG_ING.DEC_CHA] = ING.DEC_CHA;
FLAG_ING_TO_ING[FLAG_ING.INC_SEN] = ING.INC_SEN;
FLAG_ING_TO_ING[FLAG_ING.DEC_SEN] = ING.DEC_SEN;
FLAG_ING_TO_ING[FLAG_ING.INC_ALL_BASE] = ING.INC_ALL_BASE;
FLAG_ING_TO_ING[FLAG_ING.DEC_ALL_BASE] = ING.DEC_ALL_BASE;

FLAG_ING_TO_ING[FLAG_ING.ENHANCED_DAMAGE_REDUC] = ING.ENHANCED_DAMAGE_REDUC;
FLAG_ING_TO_ING[FLAG_ING.MAGIC_SHIELD] = ING.MAGIC_SHIELD;

FLAG_ING_TO_ING[FLAG_ING.INVULNERABLE] = ING.INVULNERABLE;
FLAG_ING_TO_ING[FLAG_ING.BASE_ATTRIBUTE] = ING.BASE_ATTRIBUTE;
FLAG_ING_TO_ING[FLAG_ING.DEF_ATTRIBUTE] = ING.DEF_ATTRIBUTE;
FLAG_ING_TO_ING[FLAG_ING.ATK_ATTRIBUTE] = ING.ATK_ATTRIBUTE;

global.ING_TO_STB = {};
ING_TO_STB[ING.INC_HP] = 1;
ING_TO_STB[ING.INC_MP] = 4;
ING_TO_STB[ING.POISONED] = 7;

ING_TO_STB[ING.INC_MAX_HP] = 12;
ING_TO_STB[ING.INC_MAX_MP] = 13;

ING_TO_STB[ING.INC_MOV_SPEED] = 14;
ING_TO_STB[ING.DEC_MOV_SPEED] = 15;
ING_TO_STB[ING.INC_ATK_SPEED] = 16;
ING_TO_STB[ING.DEC_ATK_SPEED] = 17;
ING_TO_STB[ING.INC_APOWER] = 18;
ING_TO_STB[ING.DEC_APOWER] = 19;
ING_TO_STB[ING.INC_DPOWER] = 20;
ING_TO_STB[ING.DEC_DPOWER] = 21;
ING_TO_STB[ING.INC_RES] = 22;
ING_TO_STB[ING.DEC_RES] = 23;
ING_TO_STB[ING.INC_HIT] = 24;
ING_TO_STB[ING.DEC_HIT] = 25;
ING_TO_STB[ING.INC_CRITICAL] = 26;
ING_TO_STB[ING.DEC_CRITICAL] = 28;
ING_TO_STB[ING.INC_AVOID] = 29;
ING_TO_STB[ING.DEC_AVOID] = 20;
ING_TO_STB[ING.DUMB] = 30;
ING_TO_STB[ING.SLEEP] = 31;
ING_TO_STB[ING.FAINTING] = 32;
ING_TO_STB[ING.DISGUISE] = 33;
ING_TO_STB[ING.TRANSPARENT] = 34;
ING_TO_STB[ING.SHIELD_DAMAGE] = 35;
ING_TO_STB[ING.ENHANCED_DAMAGE] = 54;

ING_TO_STB[ING.DEC_LIFE_TIME] = 43;

ING_TO_STB[ING.INC_STR] = 120;
ING_TO_STB[ING.INC_DEX] = 121;
ING_TO_STB[ING.INC_INT] = 122;
ING_TO_STB[ING.INC_CON] = 123;
ING_TO_STB[ING.INC_CHA] = 124;
ING_TO_STB[ING.INC_SEN] = 125;
ING_TO_STB[ING.INC_ALL_BASE] = 126;

ING_TO_STB[ING.DEC_STR] = 130;
ING_TO_STB[ING.DEC_DEX] = 131;
ING_TO_STB[ING.DEC_INT] = 132;
ING_TO_STB[ING.DEC_CON] = 133;
ING_TO_STB[ING.DEC_CHA] = 134;
ING_TO_STB[ING.DEC_SEN] = 135;
ING_TO_STB[ING.DEC_ALL_BASE] = 136;

ING_TO_STB[ING.ENHANCED_DAMAGE_REDUC] = 127;
ING_TO_STB[ING.MAGIC_SHIELD] = 128;

var IngStatus = function(rootObj, flags, timers, values) {
  this.rootObj = rootObj;
  this.properties = {};
  this.flags = flags || new Int64();
  this.timers = timers || [];
  this.values = values || {};
  this.onStatusChange();
};

IngStatus.Property = function() {
  this.startTime = 0;
  this.duration = 0;
  this.effect = null;
};

IngStatus.prototype.setRootObj = function(rootObj) {
  this.rootObj = rootObj;
};

IngStatus.prototype.setFlag = function(flag) {
  this.flags.lo |= flag.lo;
  this.flags.hi |= flag.hi;
};

IngStatus.prototype.hasFlag = function(flag) {
  return (this.flags.lo & flag.lo) | (this.flags.hi & flag.hi);
};

IngStatus.prototype.applySkill = function(skillIdx, successBits, primaryStat, secondaryStat) {
  var statusData = GDM.getNow('list_status');
  var skillData = GDM.getNow('skill_data');
  var skill = skillData.getData(skillIdx);

  for (var i = 0; i < 3; ++i) {
    if (!(successBits & (1 << i))) {
      continue;
    }

    var idx = 90 + i * 4;
    var state = skill[idx];
    var ability = skill[idx + 1];
    var abilityValue = skill[idx + 2];
    var changeRate = skill[idx + 3];

    if (state !== 0) {
      var data = statusData.row(state);
      this.setFlag(Int64.fromBit(data[1]));
    }
  }

  this.onStatusChange();
};

IngStatus.prototype.onStatusChange = function() {
  var statusData = GDM.getNow('list_status');
  var self = this;

  for (var key in FLAG_ING) {
    var flag = FLAG_ING[key];

    if (!this.hasFlag(flag)) {
      continue;
    }

    var ing = FLAG_ING_TO_ING[flag];
    var rowIdx = ING_TO_STB[ing];
    var property = this.properties[ing];

    if (!rowIdx) {
      continue;
    }

    if (!property) {
      var data = statusData.row(rowIdx);
      property = new IngStatus.Property();

      var effectIdx = data[10];
      if (effectIdx) {
        EffectManager.loadEffectByIdx(effectIdx, function(effect) {
          if (effect) {
            self.rootObj.add(effect.rootObj);
            effect.play();
            property.effect = effect;
          }
        });
      }
    }

    property.startTime = new Date().getTime();
    property.duration = this.timers[ing];

    if (property.effect) {
      property.effect.play();
    }

    this.properties[ing] = property;
  }
};

IngStatus.prototype.update = function(delta) {
  // Do something!
};

module.exports = IngStatus;
