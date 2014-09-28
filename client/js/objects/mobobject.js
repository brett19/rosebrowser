'use strict';

/**
 * @constructor
 */
function MobObject(world) {
  MoveableObject.call(this, 'mob', world);

  this.charIdx = 0;
}
MobObject.prototype = new MoveableObject();
