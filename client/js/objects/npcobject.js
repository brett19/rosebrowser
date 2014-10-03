'use strict';

/**
 * @constructor
 */
function NpcObject(world) {
  ActorObject.call(this, 'npc', world);

  this.charIdx = undefined;
  this.eventIdx = undefined;
  this.stats = undefined;
}
NpcObject.prototype = Object.create( ActorObject.prototype );
