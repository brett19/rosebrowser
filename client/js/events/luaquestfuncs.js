var QF = {};

QF.checkQuestCondition = function(triggerName) {
  var questScripts = GDM.getNow('quest_scripts');
  luaConsole.debug('QF_checkQuestCondition(', triggerName, ')');
  var res = questScripts.checkOnly(triggerName);
  luaConsole.debug('QF_checkQuestCondition Result:', res);
  return [ res ? 1 : 0 ];
};

QF.doQuestTrigger = function(triggerName) {
  if (QF.checkQuestCondition(triggerName)[0] <= 0) {
    return [ 0 ];
  }

  netGame.questRequest(TYPE_QUEST_REQ_DO_TRIGGER, 0, 0, triggerName);
  return [ 1 ];
};

QF.getEpisodeVAR = function(varNo) {
  return [ MC.quests.getEpisodeVar(varNo) ];
};

QF.getJobVAR = function(varNo) {
  return [ MC.quests.getJobVar(varNo) ];
};

QF.getPlanetVAR = function(varNo) {
  return [ MC.quests.getPlanetVar(varNo) ];
};

QF.getUnionVAR = function(varNo) {
  return [ MC.quests.getUnionVar(varNo) ];
};

QF.getUserSwitch = function(switchId) {
  return [ MC.quests.getSwitch(switchId) ];
};

QF.getQuestCount = function() {
  return [ MC.quests.getQuestCount() ];
};

QF.findQuest = function(id) {
  return [ MC.quests.findQuestByID(id) ];
};

QF.getQuestID = function(questNo) {
  return [ MC.quests.getQuestId(questNo) ];
};

QF.getQuestItemQuantity = function(questID, itemSn) {
  var itemType = Math.floor(itemSn / 1000);
  var itemNo = itemSn % 1000;
  return [ MC.quests.getQuestItemQuantity(questID, itemType, itemNo) ];
};

QF.getQuestSwitch = function(questNo, id) {
  return [ MC.quests.getQuestSwitch(questNo, id) ];
};

QF.getQuestVar = function(questNo, id) {
  return [ MC.quests.getQuestVar(questNo, id) ];
};

QF.getEventOwner = function(event) {
  return [ event.npc.serverObjectIdx ];
};

QF.getNpcQuestZeroVal = function(objectIdx) {
  var obj = GZM.findByServerObjectIdx(objectIdx);

  if (obj instanceof NpcObject) {
    return [ obj.eventVar[0] || 0 ];
  } else {
    return [ 0 ];
  }
};

module.exports = QF;
