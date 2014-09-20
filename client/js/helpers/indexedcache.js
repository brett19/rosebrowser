'use strict';

function IndexedCache(getFunc) {
  this.items = {};
  this.getFunc = getFunc;
}

IndexedCache.prototype.get = function(index, callback) {
  var item = this.items[index];
  if (item) {
    if (item.data) {
      callback(item.data);
    } else {
      item.waiters.push(callback);
    }
    return;
  }

  var newItem = {
    data: null,
    waiters: [callback]
  };
  this.items[index] = newItem;

  this.getFunc(index, function(data) {
    newItem.data = data;
    for (var i = 0; i < newItem.waiters.length; ++i) {
      newItem.waiters[i](data);
    }
    newItem.waiters = [];
  });
};


// Little helper for dealing with path based indexes.
function DataCache(loader) {
  this.cache = new IndexedCache(loader.load);
}
DataCache.prototype.get = function(path, callback) {
  var normPath = normalizePath(path);
  return this.cache.get(normPath, callback);
};
