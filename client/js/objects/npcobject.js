'use strict';

/**
 * @constructor
 */
function NpcObject(world) {
  MoveableObject.call(this, 'npc', world);

  this.charIdx = undefined;
  this.eventIdx = undefined;
  this.stats = undefined;
}
NpcObject.prototype = new MoveableObject();
