'use strict';

function DataManager() {
  this._items = {};
  this._cache = new IndexedCache(this._cachedGet.bind(this));
}

DataManager.prototype._cachedGet = function(index, callback) {
  // This assumes all accessors to the cache have validated the resource
  //   is a valid and registered resource.
  var item = this._items[index];

  item.loader.load.call(this, item.path, callback);
};

DataManager.prototype.register = function(name, loader, path) {
  if (this._items[name]) {
    console.warn('Attempted to register alread registered data resource.');
    return;
  }

  this._items[name] = {
    loader: loader,
    path: path
  };
};

DataManager.prototype.getNow = function(name) {
  if (!this._items[name]) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  return this._cache.getNow(name);
};

DataManager.prototype._getOne = function(name, callback) {
  var item = this._items[name];
  if (!item) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  this._cache.get(name, callback);
};

/**
 * @param {...string} resource_list The list of resources to load.
 * @param {function(...)} callback The callback to invoke with all the resources.
 */
DataManager.prototype.get = function() {
  var argsLen = arguments.length;

  var callback = arguments[arguments.length - 1];
  if (callback instanceof Function) {
    argsLen--;
  } else {
    callback = null;
  }

  // Fast path if we don't need a callback.
  if (callback === null) {
    for (var i = 0; i < argsLen; ++i) {
      this._getOne(arguments[i]);
    }
    return;
  }

  // Lets aggregate all the resources
  var results = [];
  function gotOne(resIdx, waitCallback, data) {
    results[resIdx] = data;
    waitCallback();
  }

  var waitAll = new MultiWait();
  for (var i = 0; i < argsLen; ++i) {
    results.push(null);
    this._getOne(arguments[i], gotOne.bind(this, i, waitAll.one()));
  }
  waitAll.wait(function() {
    if (callback) {
      callback.apply(this, results);
    }
  });
};

var GDM = new DataManager();
