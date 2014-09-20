'use strict';

function NpcObject(world) {
  MoveableObject.call(this, 'npc', world);

  this.charIdx = 0;
}
NpcObject.prototype = new MoveableObject();
