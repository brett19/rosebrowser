'use strict';

var NPC_DATA = {
  ATK_SPEED: 14,
  ATK_DISTANCE: 26
};

function NpcStats(npcObj, charIdx) {
  this.object = npcObj;

  var npcList = GDM.getNow('list_npc');
  this.data = npcList.row(charIdx);
}

NpcStats.prototype.getAttackSpeed = function() {
  return this.data[NPC_DATA.ATK_SPEED] / 10;
};

NpcStats.prototype.getAttackDistance = function() {
  return this.data[NPC_DATA.ATK_DISTANCE] / 100;
};
