'use strict';

/**
 * @constructor
 */
function NpcObject(world) {
  MoveableObject.call(this, 'npc', world);

  this.charIdx = 0;
  this.eventIdx = 0;
}
NpcObject.prototype = new MoveableObject();
