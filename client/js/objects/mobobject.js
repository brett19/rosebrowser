'use strict';

/**
 * @constructor
 */
function MobObject(world) {
  MoveableObject.call(this, 'mob', world);

  this.charIdx = undefined;
}
MobObject.prototype = new MoveableObject();
