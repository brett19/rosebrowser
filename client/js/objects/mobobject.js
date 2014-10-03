'use strict';

/**
 * @constructor
 */
function MobObject(world) {
  ActorObject.call(this, 'mob', world);

  this.charIdx = undefined;
  this.eventIdx = undefined;
  this.stats = undefined;
}
MobObject.prototype = Object.create( ActorObject.prototype );
