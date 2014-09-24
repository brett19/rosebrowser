'use strict';

function InventoryData() {
  this.items = [];
}

InventoryData.fromPacketData = function(itemList) {
  var inv = new InventoryData();
  inv.items = itemList;
  return inv;
};
