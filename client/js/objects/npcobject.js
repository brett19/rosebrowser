'use strict';

/**
 * @constructor
 */
function NpcObject(world) {
  MobObject.call(this, world);
  this.type = 'npc';
}
NpcObject.prototype = Object.create( MobObject.prototype );
