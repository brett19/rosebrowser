'use strict';

/**
 * @constructor
 */
function ItemObject(world) {
  GameObject.call(this, 'item', world);

  this.item = null;
}
ItemObject.prototype = Object.create(GameObject.prototype);

ItemObject.prototype.setItem = function(item) {
  var itemData = GDM.getNow('item_data');
  var itemRow = itemData.getData(item.itemType, item.itemNo);
  var modelIdx = parseInt(itemRow[10]);

  this.item = item;
  this.pawn.setModel(modelIdx);
};
