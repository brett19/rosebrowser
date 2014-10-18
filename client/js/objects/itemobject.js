var GameObject = require('./gameobject');

/**
 * @constructor
 */
function ItemObject(world) {
  GameObject.call(this, 'item', world);

  this.item = null;
}
ItemObject.prototype = Object.create(GameObject.prototype);

ItemObject.prototype.setItem = function(item) {
  var modelIdx;

  if (item.itemType === ITEMTYPE.MONEY) {
    modelIdx = 0;
  } else {
    var itemData = GDM.getNow('item_data');
    var itemRow = itemData.getData(item.itemType, item.itemNo);
    modelIdx = parseInt(itemRow[10]);
  }

  this.item = item;
  this.pawn.setModel(modelIdx);
};

module.exports = ItemObject;
