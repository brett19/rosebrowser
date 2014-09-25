'use strict';

/**
 * @namespace
 */
var RoseTextureManager = {};

/**
 * A listing of all textures that have been loaded and cached.
 *
 * @type {Object.<string,THREE.CompressedTexture>}
 * @private
 */
RoseTextureManager._cachedTextures = {};

/**
 * Loads a texture and automatically assignes various properties as
 * required for the game.  Additionally will cache loaded textures so
 * further requests to the same texture will not be refetched from the server.
 *
 * NOTE: Returns a texture immediately, but loading occurs later.
 *
 * @param path
 * The path to the DDS file to load.
 * @param callback
 * Callback to invoke once the texture is fully loaded into
 * memory (but may not yet be uploaded to the GPU).
 * @returns {THREE.CompressedTexture}
 */
RoseTextureManager.load = function(path, callback) {
  var normPath = normalizePath(path);

  var foundTex = RoseTextureManager._cachedTextures[normPath];
  if (foundTex) {
    if (callback) {
      callback();
    }
    return foundTex;
  }

  var newTex = DDS.load(path, callback);
  newTex.minFilter = newTex.magFilter = THREE.LinearFilter;

  RoseTextureManager._cachedTextures[normPath] = newTex;
  return newTex;
};
