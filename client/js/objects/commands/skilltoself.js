var MoCommand = require('./command');

function SkillToSelfCmd(object, skillData) {
  MoCommand.call(this, object);
  this.pawn = this.object.pawn;
  this.skillData = skillData;
}
SkillToSelfCmd.prototype = Object.create(MoCommand.prototype);

SkillToSelfCmd.prototype.enter = function() {
  var motionIdx = this.skillData[SKILL.CASTING_MOTION];
  var timeScale = this.skillData[SKILL.CASTING_SPEED] / 100;
  this.pawn.playMotion(motionIdx, timeScale, 1, function(anim) {
    anim.once('finish', this._skillCastDone.bind(this));
  }.bind(this));
};

SkillToSelfCmd.prototype._skillCastDone = function() {
  var motionIdx = this.skillData[SKILL.REPEAT_MOTION];
  var timeScale = this.skillData[SKILL.CASTING_SPEED] / 100;
  var repeatCount = this.skillData[SKILL.REPEAT_COUNT];
  if (repeatCount < 1) {
    repeatCount = 1;
  }
  this.pawn.playMotion(motionIdx, timeScale, repeatCount, function(anim) {
    anim.once('finish', this._skillRepeatDone.bind(this));
  }.bind(this));
};

SkillToSelfCmd.prototype._skillRepeatDone = function() {
  var motionIdx = this.skillData[SKILL.MOTION];
  var timeScale = this.skillData[SKILL.SPEED] / 100;
  this.pawn.playMotion(motionIdx, timeScale, 1, function(anim) {
    anim.once('finish', this._skillDone.bind(this));
  }.bind(this));
};

SkillToSelfCmd.prototype._skillDone = function() {
  this.isComplete = true;
  this.emit('finish');
};

SkillToSelfCmd.prototype.leave = function() {
};

SkillToSelfCmd.prototype.update = function(delta) {
  return 0;
};

module.exports = SkillToSelfCmd;
