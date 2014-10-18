/**
 * @namespace
 */
var TextureManager = {};

/**
 * A listing of all textures that have been loaded and cached.
 *
 * @type {Object.<string,THREE.CompressedTexture>}
 * @private
 */
TextureManager._cachedTextures = {};

/**
 * Loads a texture and automatically assignes various properties as
 * required for the game.  Additionally will cache loaded textures so
 * further requests to the same texture will not be refetched from the server.
 *
 * NOTE: Returns a texture immediately, but loading occurs later.
 *
 * @param path
 * The path to the DDS file to load.
 * @param [callback]
 * Callback to invoke once the texture is fully loaded into
 * memory (but may not yet be uploaded to the GPU).
 * @returns {THREE.CompressedTexture}
 */
TextureManager.load = function(path, callback) {
  var normPath = normalizePath(path);

  var foundTex = TextureManager._cachedTextures[normPath];
  if (foundTex) {
    if (callback) {
      callback();
    }
    return foundTex;
  }

  var newTex = DDS.load(path, callback);
  newTex.minFilter = newTex.magFilter = THREE.LinearFilter;
  newTex.wrapS = newTex.wrapT = THREE.RepeatWrapping;

  TextureManager._cachedTextures[normPath] = newTex;
  return newTex;
};

module.exports = TextureManager;
