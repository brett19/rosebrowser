var EventEmitter = require('../util/eventemitter');

var PartyData = function() {
  EventEmitter.call(this);
  this.clear();
};

PartyData.prototype = Object.create(EventEmitter.prototype);

PartyData.getLevelMaxXP = function(level) {
  return (level * (level + 15)) * 16;
};

PartyData.Member = function() {
  this.disconnectedTime = 0;
};

PartyData.prototype.create = function() {
  this.exists = true;
  this.members = [];
  this.rule = 0;
  this.xp = 0;
  this.level = 1;
  GCM.system('New party has formed.');
};

PartyData.prototype.clear = function() {
  this.exists = false;
  this.members = [];
  this.leaderIdx = 0;
  this.leaderTag = 0;
  this.rule = 0;
  this.xp = 0;
  this.level = 0;
  this.emit('changed');
};

PartyData.prototype.addMembers = function(members) {
  for (var i = 0; i < members.length; ++i) {
    GCM.system(members[i].name + ' has joined the party.');
  }

  this.members = this.members.concat(members);
  this.emit('changed');
};

PartyData.prototype.removeMember = function(serverTag) {
  for (var i = 0; i < this.members.length; ++i) {
    if (this.members[i].serverTag === serverTag) {
      this.members.splice(i, 1);
      return true;
    }
  }

  return false;
};

PartyData.prototype.updateMember = function(serverTag, data) {
  var member = MC.party.findMemberByTag(serverTag);

  if (member) {
    member.serverIdx = data.serverIdx;
    member.maxHP = data.maxHP;
    member.hp = data.hp;
    member.status = data.status;
    member.con = data.con;
    member.recoverHP = data.recoverHP;
    member.recoverHPRate = data.recoverHPRate;
    member.recoverMP = data.recoverMP;
    member.recoverMPRate = data.recoverMPRate;
    member.stamina = data.stamina;
    this.emit('changed');
  }
};

PartyData.prototype.levelup = function() {
  GCM.system('Party is now level ' + this.level + '!');
};

PartyData.prototype.disconnectMember = function(serverTag) {
  var member = this.findMemberByTag(serverTag);

  if (!member) {
    return false;
  }

  GCM.system(member.name + ' has disconnected.');
  member.disconnectedTime = new Date().getTime();
  this.emit('changed');
  return true;
};

PartyData.prototype.kickMember = function(serverTag) {
  if (serverTag === MC.uniqueTag) {
    GCM.system('You were kicked from the party.');
    MC.party.clear();
  } else {
    var member = this.findMemberByTag(serverTag);

    if (member) {
      GCM.system(member.name + ' has been kicked from the party.');
    }

    this.removeMember(serverTag);
    this.emit('changed');
  }
};

PartyData.prototype.leaveMember = function(serverTag) {
  var member = this.findMemberByTag(serverTag);

  if (member) {
    GCM.system(member.name + ' has left the party.');
  }

  this.removeMember(serverTag);
  this.emit('changed');
};

PartyData.prototype.setLeaderByIdx = function(serverIdx) {
  if (serverIdx === MC.serverObjectIdx) {
    this.setLeader(MC.serverObjectIdx, MC.uniqueTag);
  } else {
    var member = this.findMemberByIdx(serverIdx);
    this.setLeader(member.serverIdx, member.serverTag);
  }
};

PartyData.prototype.setLeader = function(serverIdx, serverTag) {
  this.leaderIdx = serverIdx;
  this.leaderTag = serverTag;

  if (this.leaderTag === MC.uniqueTag) {
    GCM.system('You have been given party leadership.');
  } else {
    var member = this.findMemberByTag(serverTag);

    if (member) {
      GCM.system(member.name + ' has been given party leadership.');
    }
  }

  this.emit('changed');
};

PartyData.prototype.setLevelXP = function(level, xp) {
  this.xp = xp;
  this.level = level;
  this.emit('changed');
};

PartyData.prototype.setRule = function(rule) {
  this.rule = rule;
  GCM.system('Party options have changed.');

  if (rule & PARTY_RULE_ITEM_TO_ORDER) {
    GCM.system('Item Earning Priority: Even Share');
  } else {
    GCM.system('Item Earning Priority: Free-For-All');
  }

  if (rule & PARTY_RULE_EXP_PER_PLAYER) {
    GCM.system('Experience Rate: Equal Share Off');
  } else {
    GCM.system('Experience Rate: Equal Share On');
  }

  this.emit('changed');
};

PartyData.prototype.findMemberByIdx = function(serverIdx) {
  for (var i = 0; i < this.members.length; ++i) {
    var member = this.members[i];

    if (member.serverIdx === serverIdx) {
      return member;
    }
  }

  return null;
};

PartyData.prototype.findMemberByTag = function(serverTag) {
  for (var i = 0; i < this.members.length; ++i) {
    var member = this.members[i];

    if (member.serverTag === serverTag) {
      return member;
    }
  }

  return null;
};

module.exports = PartyData;
