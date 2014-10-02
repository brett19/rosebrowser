'use strict';

/**
 * @constructor
 */
function MobObject(world) {
  ActorObject.call(this, 'mob', world);

  this.charIdx = undefined;
  this.stats = undefined;
}
MobObject.prototype = new ActorObject();
