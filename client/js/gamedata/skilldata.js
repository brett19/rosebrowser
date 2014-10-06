'use strict';

var SkillData = function() {
  EventEmitter.call(this);
  this.skills = [];
};

SkillData.prototype = Object.create(EventEmitter.prototype);

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
