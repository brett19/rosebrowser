'use strict';

var NFileLoader = {};

NFileLoader.genPath = function(prefix, key) {
  if (!(key instanceof String)) {
    key = key.toString(16);
  }
  return normalizePath(ROSE_DATA_PATH + 'cache/' + prefix + '/' + key);
};

NFileLoader.load = function(prefix, key, callback) {
  var realPath = NFileLoader.genPath(prefix, key);
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(realPath, function (buffer) {
    callback(null, buffer);
  }, undefined, function(err) {
    callback(err, null);
  });
};
