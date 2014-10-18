global.SKILL = {
  TAB_TYPE: 4,
  TYPE: 5,
  BASIC_COMMAND: 6,
  RANGE: 6,
  CASTING_MOTION: 52,
  CASTING_SPEED: 53,
  REPEAT_MOTION: 54,
  REPEAT_COUNT: 55,
  CASTING_EFFECT1: 56,
  CASTING_POINT1: 57,
  MOTION: 68,
  SPEED: 69,
  NUMHITS: 70,
  ANI_ACTION_TYPE: 68,
  SLOT_NUM: 111
};

global.SKILL_ACTION_TYPE = {
  BASE_ACTION: 1,
  CREATE_WINDOW: 2,
  ACTION_IMMEDIATE: 3,
  ACTION_ENFORCE_WEAPON: 4,
  ACTION_ENFORCE_BULLET: 5,
  ACTION_FIRE_BULLET: 6,
  ACTION_AREA_TARGET: 7,
  ACTION_SELF_BOUND_DURATION: 8,
  ACTION_TARGET_BOUND_DURATION: 9,
  ACTION_SELF_BOUND: 10,
  ACTION_TARGET_BOUND: 11,
  ACTION_SELF_STATE_DURATION: 12,
  ACTION_TARGET_STATE_DURATION: 13,
  ACTION_SUMMON_PET: 14,
  ACTION_PASSIVE: 15,
  EMOTION_ACTION: 16,
  ACTION_SELF_DAMAGE: 17,
  ACTION_WARP: 18,
  ACTION_SELF_AND_TARGET: 19,
  ACTION_RESURRECTION: 20
};

global.BASIC_COMMAND = {
  SIT: 1,
  PICK_ITEM: 2,
  JUMP: 3,
  AIR_JUMP: 4,
  AUTO_TARGET: 5,
  ATTACK: 6,
  DRIVE_CART: 7,
  ADD_FRIEND: 8,
  PARTY: 9,
  EXCHANGE: 10,
  PRIVATE_STORE: 11,
  SELF_TARGET: 12,
  BOARD_CART: 13,
  CASTLE_GEAR: 14
};

/**
 * @constructor
 */
function SkillDataManager() {
  this.data = null;
  this.strings = null;
}

SkillDataManager.prototype.getData = function(skillNo) {
  return this.data.row(skillNo);
};

SkillDataManager.prototype.getName = function(skillNo) {
  var itemKey = this.data.item(skillNo, this.data.columnCount - 1);
  return this.strings.getByKey(itemKey).text;
};

SkillDataManager.prototype.getDescription = function(skillNo) {
  var itemKey = this.data.item(skillNo, this.data.columnCount - 1);
  return this.strings.getByKey(itemKey).comment;
};

/**
 * Load helper so the ItemDataManager can be controlled by the GDM.
 *
 * @param path Ignores
 * @param callback
 */
SkillDataManager.load = function(path, callback) {
  var waitAll = new MultiWait();
  var mgr = new SkillDataManager();
  DataTable.load('3DDATA/STB/LIST_SKILL.STB', function(waitCallback, data) {
    mgr.data = data;
    waitCallback();
  }.bind(this, waitAll.one()));
  StringTable.load('3DDATA/STB/LIST_SKILL_S.STL', function(waitCallback, data) {
    mgr.strings = data;
    waitCallback();
  }.bind(this, waitAll.one()));
  waitAll.wait(function() {
    callback(mgr);
  });
};

module.exports = SkillDataManager;
