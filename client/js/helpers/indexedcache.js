'use strict';

/**
 * An indexed cache allowing you to generically request asynchronously
 * loaded or created resources by name, and those resources are only loaded
 * or created once.  Any future requests for the same index will use the
 * cached value.
 *
 * @constructor
 * @param {Function(index,callback)} getFunc
 * The function used to load a requested index.
 */
function IndexedCache(getFunc) {
  this._items = {};
  this._getFunc = getFunc;
}

/**
 * Synchronously returns a value from the cache.  This index must
 * already have been load prior to this call or an Error will be thrown.
 *
 * @param {string} index
 * The index to retrieve.
 * @returns {*}
 */
IndexedCache.prototype.getNow = function(index) {
  var item = this._items[index];
  if (!item || !item.data) {
    throw new Error('Attempted to getNow an unloaded data resource (' + index + ').');
  }

  return item.data;
};

/**
 * Retrieves a single resource from the cache, loading it if it has not
 * already been loaded.
 *
 * @param {string} name
 * The index of the resource to retrieve.
 * @param {Function} [callback]
 */
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


/**
 * An IndexedCache variant intended for use with a loader and file paths.
 * Automatically handles normalizing the path as much as possible to ensure
 * alternate references to the same file still uses the cache.
 *
 * @constructor
 * @param {Loader} loader
 * The loader to use with this DataCache.
 */
function DataCache(loader) {
  this._cache = new IndexedCache(loader.load);
}

/**
 * Retrieves a single file from the cache, loading it if it has not
 * already been loaded.
 *
 * @param {string} path
 * The file to retrieve from the cache.
 * @param {Function} [callback]
 */
DataCache.prototype.get = function(path, callback) {
  var normPath = normalizePath(path);
  this._cache.get(normPath, callback);
};
