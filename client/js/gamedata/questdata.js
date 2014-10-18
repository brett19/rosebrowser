var EventEmitter = require('../util/eventemitter');

var QuestData = function() {
  EventEmitter.call(this);

  this.quests = null;
  this.dailyLog = null;
  this.vars = null;
  this.items = [];
};

QuestData.QUEST = {
  EPISODE_VARS: 5,
  JOB_VARS: 3,
  PLANET_VARS: 7,
  UNION_VARS: 10,
  USER_SWITCHES: 512,
  PLAYER_QUESTS: 10,
  QUEST_VARS: 10,
  QUEST_SWITCHES: 32
};

QuestData.SwitchBitMask = [ 0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80 ];

QuestData.DailyLog = function() { // quest_completion_data
  this.dailyQuests = 0;
  this.quests = [];
};

QuestData.Item = function() {
  this.quest = 0;
  this.item = null;
};

QuestData.Variables = function() {
  this.episode = [];
  this.job = [];
  this.planet = [];
  this.union = [];
  this.switches = [];
};

QuestData.Quest = function() {
  this.id = 0;
  this.expiryTime = 0;
  this.vars = [];
  this.switches = [];
};

QuestData.prototype = Object.create(EventEmitter.prototype);

QuestData.prototype.setQuests = function(quests) {
  this.quests = quests;
  this.emit("changed");
};

QuestData.prototype.setVars = function(vars) {
  this.vars = vars;
  this.emit("changed");
};

QuestData.prototype.setItems = function(items) {
  this.items = items;
  this.emit("changed");
};

QuestData.prototype.setDailyLog = function(log) {
  this.dailyLog = log;
  this.emit("changed");
};

QuestData.prototype.getSwitch = function(id) {
  if (id < 0 || id >= QuestData.QUEST.USER_SWITCHES) {
    console.warn('QuestData.getSwitch(' + id + ') id is out of range');
    return -1;
  }

  var switchByte = this.vars.switches[Math.floor(id / 8)];
  var result = (switchByte & QuestData.SwitchBitMask[id & 0x7]) !== 0;

  console.log('QuestData.getSwitch(' + id + ') = ' + result);
  return result ? 1 : 0;
};

QuestData.prototype.getEpisodeVar = function(id) {
  if (id < 0 || id >= QuestData.QUEST.EPISODE_VARS) {
    console.warn('QuestData.getEpisodeVar(' + id + ') id is out of range');
    return -1;
  }

  console.log('QuestData.getEpisodeVar(' + id + ') = ' + this.vars.episode[id]);
  return this.vars.episode[id];
};

QuestData.prototype.getJobVar = function(id) {
  console.log('QuestData.getJobVar(' + id + ')');

  if (id < 0 || id >= QuestData.QUEST.JOB_VARS) {
    console.warn('QuestData.getJobVar(' + id + ') id is out of range');
    return -1;
  }

  console.log('QuestData.getJobVar(' + id + ') = ' + this.vars.job[id]);
  return this.vars.job[id];
};

QuestData.prototype.getPlanetVar = function(id) {
  if (id < 0 || id >= QuestData.QUEST.PLANET_VARS) {
    console.warn('QuestData.getPlanetVar(' + id + ') id is out of range');
    return -1;
  }

  console.log('QuestData.getPlanetVar(' + id + ') = ' + this.vars.planet[id]);
  return this.vars.planet[id];
};

QuestData.prototype.getUnionVar = function(id) {
  if (id < 0 || id >= QuestData.QUEST.UNION_VARS) {
    console.warn('QuestData.getUnionVar(' + id + ') id is out of range');
    return -1;
  }

  console.log('QuestData.getUnionVar(' + id + ') = ' + this.vars.union[id]);
  return this.vars.union[id];
};

QuestData.prototype.getQuestCount = function() {
  var count = 0;

  for (var i = 0; i < this.quests.length; ++i) {
    if (this.quests[i].id !== 0) {
      count++;
    }
  }

  console.log('QuestData.getQuestCount() = ' + count);
  return count;
};

QuestData.prototype.getQuest = function(questNo) {
  if (questNo < 0 || questNo >= QuestData.QUEST.PLAYER_QUESTS) {
    console.warn('QuestData.getQuest(' + questNo + ') questNo is out of range');
    return null;
  }

  return this.quests[questNo];
};

QuestData.prototype.findQuestByID = function(questID) {
  var result = -1;

  for (var i = 0; i < this.quests.length; ++i) {
    if (this.quests[i].id === questID) {
      result = i;
      break;
    }
  }

  console.log('QuestData.findQuestByID(' + questID + ') = ' + result);
  return result;
};

QuestData.prototype.getQuestId = function(questNo) {
  if (questNo < 0 || questNo >= QuestData.QUEST.PLAYER_QUESTS) {
    console.warn('QuestData.getQuestId(' + questNo + ') questNo is out of range');
    return -1;
  }

  console.log('QuestData.getQuestId(' + questNo + ') = ' + this.quests[questNo].id);
  return this.quests[questNo].id;
};

QuestData.prototype.getQuestItemQuantity = function(questID, type, id) {
  var count = 0;

  for (var i = 0; i < this.items.length; ++i) {
    var questItem = this.items[i];

    if (questItem.quest === questID) {
      var item = questItem.item;

      if (item.itemNo === id && item.itemType === type) {
        count += item.quantity;
      }
    }
  }

  console.log('QuestData.getQuestItemQuantity(' + questID + ', ' + type + ', ' + id + ') = ' + count);
  return count;
};

QuestData.prototype.getQuestSwitch = function(questNo, switchID) {
  if (questNo < 0 || questNo >= QuestData.QUEST.PLAYER_QUESTS) {
    console.warn('QuestData.getQuestSwitch(' + questNo + ') questNo is out of range');
    return -1;
  }

  if (switchID < 0 || switchID >= QuestData.QUEST.QUEST_SWITCHES) {
    console.warn('QuestData.getQuestSwitch(' + switchID + ') switch is out of range');
    return -1;
  }

  var switchByte = this.quests[questNo].switches[Math.floor(switchID / 8)];
  var result = (switchByte & QuestData.SwitchBitMask[switchID & 0x7]) !== 0;

  console.log('QuestData.getQuestSwitch(' + questNo + ', ' + switchID + ') = ' + result);
  return result ? 1 : 0;
};

QuestData.prototype.getQuestVar = function(questNo, varID) {
  if (questNo < 0 || questNo >= QuestData.QUEST.PLAYER_QUESTS) {
    console.warn('QuestData.getQuestVar(' + questNo + ') questNo is out of range');
    return -1;
  }

  if (varID < 0 || varID >= QuestData.QUEST.QUEST_VARS) {
    console.warn('QuestData.getQuestVar(' + varID + ') varID is out of range');
    return -1;
  }

  console.log('QuestData.getQuestVar(' + questNo + ', ' + varID + ') = ' + this.quests[questNo].vars[varID]);
  return this.quests[questNo].vars[varID];
};

QuestData.prototype.getQuestTimer = function(questNo) {
  if (questNo < 0 || questNo >= QuestData.QUEST.PLAYER_QUESTS) {
    console.warn('QuestData.getQuestTimer(' + questNo + ') questNo is out of range');
    return -1;
  }

  console.log('QuestData.getQuestTimer(' + questNo + ') = ' + this.quests[questNo].expiryTime);
  return this.quests[questNo].expiryTime;
};

module.exports = QuestData;
