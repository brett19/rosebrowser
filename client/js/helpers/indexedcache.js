'use strict';

function IndexedCache(getFunc) {
  this._items = {};
  this._getFunc = getFunc;
}

IndexedCache.prototype.getNow = function(index) {
  var item = this._items[index];
  if (!item || !item.data) {
    throw new Error('Attempted to getNow an unloaded data resource (' + index + ').');
  }

  return item.data;
};

IndexedCache.prototype.get = function(index, callback) {
  var item = this._items[index];
  if (item) {
    if (callback) {
      if (item.data) {
        callback(item.data);
      } else {
        item.waiters.push(callback);
      }
    }
    return;
  }

  var newItem = {
    data: null,
    waiters: callback ? [callback] : []
  };
  this._items[index] = newItem;

  this._getFunc(index, function(data) {
    newItem.data = data;
    for (var i = 0; i < newItem.waiters.length; ++i) {
      newItem.waiters[i](data);
    }
    newItem.waiters = [];
  });
};


// Little helper for dealing with path based indexes.
function DataCache(loader) {
  this._cache = new IndexedCache(loader.load);
}
DataCache.prototype.get = function(path, callback) {
  var normPath = normalizePath(path);
  return this._cache.get(normPath, callback);
};
