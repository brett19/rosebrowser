'use strict';

/**
 * @constructor
 */
function MobObject(world) {
  ActorObject.call(this, 'mob', world);

  this.charIdx = undefined;
  this.stats = undefined;
  this.pawn = undefined;
}
MobObject.prototype = Object.create( ActorObject.prototype );

MobObject.prototype.update = function(delta) {
  ActorObject.prototype.update.call(this, delta);
  this.pawn.update(delta);
};
