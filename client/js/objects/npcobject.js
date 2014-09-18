'use strict';

function NpcObject(world) {
  GameObject.call(this, 'npc', world);

  this.charIdx = 0;
  this.direction = 0;
}
NpcObject.prototype = new GameObject();

NpcObject.prototype.setDirection = function(angle) {
  this.direction = angle;
};
