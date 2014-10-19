var EventEmitter = require('../util/eventemitter');

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
    this._useCommand(command);
    break;
  case SKILL_ACTION_TYPE.EMOTION_ACTION:
    var motion = parseInt(data[SKILL.ANI_ACTION_TYPE]);
    netGame.setMotion(motion, 1);
    break;
  case SKILL_ACTION_TYPE.ACTION_TARGET_BOUND:
  case SKILL_ACTION_TYPE.ACTION_TARGET_BOUND_DURATION:
  case SKILL_ACTION_TYPE.ACTION_TARGET_STATE_DURATION:
  case SKILL_ACTION_TYPE.ACTION_SELF_AND_TARGET:
  case SKILL_ACTION_TYPE.ACTION_RESURRECTION:
  case SKILL_ACTION_TYPE.ACTION_IMMEDIATE:
    if (MC.target && MC.target.object) {
      var targetObj = MC.target.object;
      netGame.useSkillOnTarget(skill.slot, targetObj.serverObjectIdx);
    }
    break;
  case SKILL_ACTION_TYPE.ACTION_SELF_BOUND:
  case SKILL_ACTION_TYPE.ACTION_SELF_DAMAGE:
  case SKILL_ACTION_TYPE.ACTION_SELF_BOUND_DURATION:
  case SKILL_ACTION_TYPE.ACTION_SELF_STATE_DURATION:
  case SKILL_ACTION_TYPE.ACTION_SUMMON_PET:
    netGame.useSkillOnSelf(skill.slot);
    break;
  default:
    console.warn('TODO: Unimplemented useSkill', skill);
    break;
  }
};

SkillData.prototype._useCommand = function(command) {
  var target = MC.target;
  switch (command) {
  case BASIC_COMMAND.PARTY:
    if (target) {
      if (MC.party.exists) {
        if (MC.party.leaderTag === MC.uniqueTag) {
          netGame.partyRequest(PARTY_REQ_JOIN, target.serverObjectIdx);
        } else {
          GCM.system('Only the party leader can send party invites.');
        }
      } else {
        netGame.partyRequest(PARTY_REQ_MAKE, target.serverObjectIdx);
      }
    }
    break;
  case BASIC_COMMAND.SIT:
    netGame.toggleSit();
    break;
  default:
    console.warn('Used unimplemented basic command:', command);
    break;
  }
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

module.exports = SkillData;
