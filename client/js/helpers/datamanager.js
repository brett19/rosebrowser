/**
 * @typedef Object Loader
 */

/**
 * A class used to load and track various types of data, usually used
 * for global resources that are needed throughout the application.
 *
 * @constructor
 */
function DataManager() {
  this._items = {};
  this._cache = new IndexedCache(this._cachedGet.bind(this));
}

/**
 * Loads a resource by its name.
 *
 * Used internally by the IndexedCache to retrieve an item that is not
 * yet been loaded.
 * @param {string} index
 * @param {Function} callback
 * @private
 */
DataManager.prototype._cachedGet = function(index, callback) {
  // This assumes all accessors to the cache have validated the resource
  //   is a valid and registered resource.
  var item = this._items[index];

  item.loader.load.call(this, item.path, callback);
};

/**
 * Registers a new resource to the DataManager.
 *
 * @param {string} name
 * The name to use for this resource.
 * @param {Loader} loader
 * The loader responsible for loading this resource.
 * @param {string} [path]
 * The file path for the resource.
 */
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

/**
 * Synchronously returns a resource from the manager.  This object must
 * already have been load prior to this call or an Error will be thrown.
 *
 * @param {string} name
 * The name of the resource to retrieve.
 * @returns {*}
 */
DataManager.prototype.getNow = function(name) {
  if (!this._items[name]) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  return this._cache.getNow(name);
};

/**
 * Retrieves a single resource from the manager.  Loading it if it
 * has not already been loaded.
 *
 * @param {string} name
 * @param {Function} [callback]
 * @private
 */
DataManager.prototype._getOne = function(name, callback) {
  var item = this._items[name];
  if (!item) {
    throw new Error('Attempted to retrieve unregistered data resource (' + name + ').');
  }

  this._cache.get(name, callback);
};

/**
 * Retrieves the list of resources that were passed as arguements and then
 * invokes the callback, passing those resources back in the identical order.
 *
 * @param {...string} resource_list
 * The list of resources to load.
 * @param {function(...)} [callback]
 * The callback to invoke with all the resources.
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

module.exports = DataManager;
