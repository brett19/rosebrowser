'use strict';

function QF_checkQuestCondition(triggerName) {
  var questScripts = GDM.getNow('quest_scripts');
  luaConsole.debug('QF_checkQuestCondition(', triggerName, ')');
  var res = questScripts.checkOnly(triggerName);
  luaConsole.debug('QF_checkQuestCondition Result:', res);
  return [ res ? 1 : 0 ];
}

function QF_doQuestTrigger(triggerName) {
  if (QF_checkQuestCondition(triggerName)[0] <= 0) {
    return [ 0 ];
  }

  netGame.questRequest(TYPE_QUEST_REQ_DO_TRIGGER, 0, 0, triggerName);
  return [ 1 ];
}

function QF_getEpisodeVAR(varNo) {
  return [ MC.quests.getEpisodeVar(varNo) ];
}

function QF_getJobVAR(varNo) {
  return [ MC.quests.getJobVar(varNo) ];
}

function QF_getPlanetVAR(varNo) {
  return [ MC.quests.getPlanetVar(varNo) ];
}

function QF_getUnionVAR(varNo) {
  return [ MC.quests.getUnionVar(varNo) ];
}

function QF_getUserSwitch(switchId) {
  return [ MC.quests.getSwitch(switchId) ];
}

function QF_getQuestCount() {
  return [ MC.quests.getQuestCount() ];
}

function QF_findQuest(id) {
  return [ MC.quests.findQuestByID(id) ];
}

function QF_getQuestID(questNo) {
  return [ MC.quests.getQuestId(questNo) ];
}

function QF_getQuestItemQuantity(questID, itemSn) {
  var itemType = Math.floor(itemSn / 1000);
  var itemNo = itemSn % 1000;
  return [ MC.quests.getQuestItemQuantity(questID, itemType, itemNo) ];
}

function QF_getQuestSwitch(questNo, id) {
  return [ MC.quests.getQuestSwitch(questNo, id) ];
}

function QF_getQuestVar(questNo, id) {
  return [ MC.quests.getQuestVar(questNo, id) ];
}

function QF_getEventOwner(event) {
  return [ event.npc.serverObjectIdx ];
}
