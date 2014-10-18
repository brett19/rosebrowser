'use strict';

function IndexedDb() {
  this.itemCount = 0;
}

IndexedDb.prototype.get = function(itemId) {

};



function ZoneList() {
  IndexedDb.call(this);
}
ZoneList.prototype = Object.create(IndexedDb);
