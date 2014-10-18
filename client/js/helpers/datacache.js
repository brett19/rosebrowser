var IndexedCache = require('./indexedcache');

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

module.exports = DataCache;
