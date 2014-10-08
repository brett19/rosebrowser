'use strict';

var DEFAULT_ATTACK_DISTANCE = 0.7;

/**
 * @constructor
 */
function CharObject(world) {
  ActorObject.call(this, 'char', world);

  this.name = undefined;
  this.level = undefined;
  this.job = undefined;
  this.gender = undefined;
  this.hairColor = undefined;
  this.hp = undefined;
  this.visParts = undefined;
  this.stats = undefined;

  this.isRunning = true;
  this.isSitting = false;
}
CharObject.prototype = Object.create( ActorObject.prototype );

CharObject.prototype._skillToObj = function(objectRef, skillIdx) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _attackObj was not a GORef.');
    return;
  }

  var skillData = GDM.getNow('skill_data');
  var skill = skillData.getData(skillIdx);

  return this._setNextCmd(new SkillToObjCmd(this, objectRef, skill));
};

CharObject.prototype._setMotion = function(motionIdx) {
  // Timescale should not be hardcoded here...
  this.pawn.playMotion(motionIdx, 1.0, false)
};

CharObject.prototype.getAbilityValue = function(abilType) {
  switch(abilType) {
    case ABILTYPE.SEX: return this.gender;
    case ABILTYPE.CLASS: return this.job;
    case ABILTYPE.LEVEL: return this.level;
    case ABILTYPE.HAIRCOLOR: return this.hairColor;
    case ABILTYPE.HP: return this.hp;
  }

  console.warn('Attempted to retrieve unknown ability value:', abilType);
  return 0;
};

CharObject.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['name'],
    ['level', 0, 255],
    ['gender', 0, 1],
    ['hairColor', 0],
    ['hp', 0, 999999],
    ['visParts'],
    ['stats'],
    ['pawn']
  ]);
  if (this.stats) {
    this.stats.debugValidate();
  }
};
