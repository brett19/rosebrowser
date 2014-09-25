'use strict';

/**
 * @constructor
 */
function ItemObject(world) {
  GameObject.call(this, 'item', world);
}
ItemObject.prototype = new ItemObject();
