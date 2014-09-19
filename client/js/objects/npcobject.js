'use strict';

function NpcObject(world) {
  MoveableObject.call(this, 'npc', world);

  this.charIdx = 0;
  this.direction = 0;
}
NpcObject.prototype = new MoveableObject();

NpcObject.prototype.setDirection = function(angle) {
  this.direction = angle;
};
