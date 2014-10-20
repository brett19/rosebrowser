global.NPC_DATA = {
  ATK_SPEED: 14,
  ATK_DISTANCE: 26,
  HEIGHT: 42
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

NpcStats.prototype.getHeight = function() {
  if (!this.data[NPC_DATA.HEIGHT]) {
    return 0;
  } else {
    return parseInt(this.data[NPC_DATA.HEIGHT]) / 100;
  }
};

module.exports = NpcStats;
