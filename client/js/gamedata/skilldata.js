'use strict';

var SkillData = function() {
  EventEmitter.call(this);
  this.skills = [];
};

SkillData.prototype = Object.create(EventEmitter.prototype);

SkillData.prototype.useSkill = function(skill) {
  var skillData = GDM.getNow('skill_data');
  var data = skillData.getData(skill.skillIdx);
  var type = parseInt(data[SKILL.TYPE]);

  switch(type) {
  case SKILL_ACTION_TYPE.BASE_ACTION:
    var command = parseInt(data[SKILL.BASIC_COMMAND]);
    // TODO: execute BASIC_COMMAND
    break;
  case SKILL_ACTION_TYPE.EMOTION_ACTION:
    var motion = parseInt(data[SKILL.ANI_ACTION_TYPE]);
    netGame.setMotion(motion, 1);
    break;
  }
  console.warn('TODO: Unimplemented useSkill', skill);
};

SkillData.prototype.setSkills = function(skills) {
  this.skills = skills;
  this.emit('changed');
};

SkillData.prototype.appendSkills = function(skills) {
  this.skills = this.skills.concat(skills);
  this.emit('changed');
};

SkillData.prototype.findBySlot = function(slotNo) {
  for (var i = 0; i < this.skills.length; ++i) {
    if (this.skills[i].slot === slotNo) {
      return this.skills[i];
    }
  }

  return null;
};
