'use strict';

/**
 * @namespace
 */
var ROSETexLoader = {};

/**
 * Loads a texture and automatically assignes various properties as
 * required for the game.
 *
 * NOTE: Returns texture immediately, but doesn't load till later.
 *
 * @param path
 * The path to the DDS file to load.
 * @param callback
 * Callback to invoke once the texture is fully loaded into
 * memory (but may not yet be uploaded to the GPU).
 * @returns {THREE.CompressedTexture}
 */
ROSETexLoader.load = function(path, callback) {
  var tex = DDS.load(path, callback);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.path = path;
  return tex;
};
