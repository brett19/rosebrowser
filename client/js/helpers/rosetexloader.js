'use strict';

/**
 * @note Returns texture immediately, but doesn't load till later.
 */
var ROSETexLoader = {};
ROSETexLoader.load = function(path, callback) {
  var tex = DDS.Loader.load(path, function() {
    if (callback) {
      callback();
    }
  });
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  return tex;
};
