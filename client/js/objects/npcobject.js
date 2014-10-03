'use strict';

/**
 * @constructor
 */
function NpcObject(world) {
  ActorObject.call(this, 'npc', world);

  this.charIdx = undefined;
  this.eventIdx = undefined;
  this.stats = undefined;
  this.pawn = undefined;
}
NpcObject.prototype = Object.create( ActorObject.prototype );

NpcObject.prototype.update = function(delta) {
  ActorObject.prototype.update.call(this, delta);
  this.pawn.update(delta);
};
