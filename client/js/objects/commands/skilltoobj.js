var MoCommand = require('./command');
var MoveToObjCmd = require('./movetoobj');
var AttackCmd = require('./attack');

function _SkillToObjCmd(object, targetObjRef, skillData) {
  MoCommand.call(this, object);
  this.pawn = this.object.pawn;
  this.target = targetObjRef;
  this.skillData = skillData;
}
_SkillToObjCmd.prototype = Object.create(MoCommand.prototype);

_SkillToObjCmd.prototype.enter = function() {
  var motionIdx = this.skillData[SKILL.CASTING_MOTION];
  var timeScale = this.skillData[SKILL.CASTING_SPEED] / 100;
  this.pawn.playMotion(motionIdx, timeScale, 1, function(anim) {
    anim.once('finish', this._skillCastDone.bind(this));
  }.bind(this));
};

_SkillToObjCmd.prototype._skillCastDone = function() {
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

_SkillToObjCmd.prototype._skillRepeatDone = function() {
  var motionIdx = this.skillData[SKILL.MOTION];
  var timeScale = this.skillData[SKILL.SPEED] / 100;
  this.pawn.playMotion(motionIdx, timeScale, 1, function(anim) {
    anim.once('finish', this._skillDone.bind(this));
  }.bind(this));
};

_SkillToObjCmd.prototype._skillDone = function() {
  this.isComplete = true;
  this.emit('finish');

  if (!this.object.nextCmd && this.target.object instanceof MobObject) {
    this.object._attackObj(this.target);
  }
};

_SkillToObjCmd.prototype.leave = function() {
};

_SkillToObjCmd.prototype.update = function(delta) {
  return 0;
};


function SkillToObjCmd(object, targetObjRef, skillData) {
  MoCommand.call(this, object);
  this.target = targetObjRef;
  this.skillData = skillData;
  this.activeCmd = null;
}
SkillToObjCmd.prototype = Object.create(MoCommand.prototype);

SkillToObjCmd.prototype.enter = function() {
  this._goOnce();
};

SkillToObjCmd.prototype.leave = function() {
  if (this.activeCmd) {
    this.activeCmd._leave();
    this.activeCmd = null;
  }
};

SkillToObjCmd.prototype._goOnce = function() {
  // Interupt here, as you cannot interupt in the middle of attack animation.
  if (this.wantInterrupt) {
    this.isComplete = true;
    return;
  }

  var skillDist = 0;
  if (this.skillData[SKILL.RANGE] !== '') {
    skillDist = parseInt(this.skillData[SKILL.RANGE]);
  } else {
    skillDist = this.object.stats.getAttackDistance();
  }

  this.activeCmd = new MoveToObjCmd(this.object, this.target, skillDist);
  this.activeCmd.on('finish', function() {
    if (!this.activeCmd) {
      return;
    }
    this.activeCmd._leave();
    this.activeCmd = new _SkillToObjCmd(this.object, this.target, this.skillData);
    this.activeCmd.on('finish', function() {
      if (!this.activeCmd) {
        return;
      }
      this.activeCmd._leave();
      this.activeCmd = null;

      this.isComplete = true;
      this.emit('finish');
    }.bind(this));
    this.activeCmd._enter();
  }.bind(this));
  this.activeCmd._enter();
};

SkillToObjCmd.prototype.update = function(delta) {
  if (this.wantInterrupt && !(this.activeCmd instanceof AttackCmd)) {
    this.isComplete = true;
    return delta;
  }

  // If object went offscreen or died, stop attacking!
  if (!this.target.object) {
    this.isComplete = true;
    return delta;
  }

  if (!this.activeCmd) {
    // This is really an error condition, we eat the delta to make sure
    //   we don't loop forever in the caller loop.
    return 0;
  }

  return this.activeCmd.update(delta);
};

module.exports = SkillToObjCmd;
