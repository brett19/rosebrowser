'use strict';

function DataManager() {
  this.items = {};
}

DataManager.prototype.register = function(name, loader, path) {
  if (this.items[name]) {
    console.warn('Attempted to register alread registered data resource.');
    return;
  }

  var newItem = {
    loader: loader,
    path: path,
    data: null,
    waiters: []
  };
  this.items[name] = newItem;
};

DataManager.prototype.evict = function(name) {
  var item = this.items[name];
  if (!item) {
    throw new Error('Attempted to evict unregistered data resource (' + name + ').');
  }

  item.data = null;
};

DataManager.prototype.getNow = function(name) {
  var item = this.items[name];
  if (!item) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  if (!item.data) {
    throw new Error('Attempted to getNow an unloaded data resource (' + name + ').');
  }

  return item.data;
};

DataManager.prototype.getOne = function(name, callback) {
  var item = this.items[name];
  if (!item) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  if (item.data !== null) {
    callback(item.data);
    return true;
  }

  if (item.waiters.length > 0) {
    item.waiters.push(callback);
    return false;
  }

  item.waiters.push(callback);
  item.loader.load(item.path, function(data) {
    item.data = data;
    for (var i = 0; i < item.waiters.length; ++i) {
      item.waiters[i](data);
    }
    item.waiters = [];
  });
};

/**
 * @param {...string} resource_list The list of resources to load.
 * @param {function(...)} callback The callback to invoke with all the resources.
 */
DataManager.prototype.get = function() {
  var self = this;
  var callback = arguments[arguments.length - 1];

  var resultsNeeded = arguments.length - 1;
  var results = [];
  for (var i = 0; i < arguments.length - 1; ++i) {
    results.push(null);
    (function(resIdx, resName) {
      self.getOne(resName, function(res) {
        results[resIdx] = res;
        resultsNeeded--;
        if (resultsNeeded === 0) {
          callback.apply(this, results);
        }
      });
    })(i, arguments[i]);
  }
};

var GDM = new DataManager();
