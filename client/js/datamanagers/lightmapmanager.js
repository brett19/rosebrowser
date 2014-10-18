/**
 * A manager for handling the textures for various parts as defined
 * by the managed lightmap data.
 *
 * @constructor
 * @param {LightmapData} data
 */
function LightmapManager(data) {
  this.data = data;
  this.textures = {};
}

/**
 * The lightmap data for a particular object and part in a MapZoneChunk.
 *
 * @constructor
 */
LightmapManager.Data = function() {
  this.objectsPerRow = 0;
  this.objectIdx = 0;
  this.texture = null;
};

/**
 * This is a helper to allow a LightmapManager to be used by the DataManager.
 *
 * @param {string} path
 * The path to the lightmap data.
 * @param {Function} [callback]
 */
LightmapManager.load = function(path, callback) {
  LightmapData.load(path, function(data) {
    callback(new LightmapManager(data));
  });
};

/**
 * Retrieves the lightmap data for a particular part.
 *
 * @param {number} objectIdx
 * The object index from the MapZoneChunk.
 * @param {number} partIdx
 * The part index from the referenced object.
 * @returns {LightmapManager.Data}
 */
LightmapManager.prototype.getDataForPart = function(objectIdx, partIdx) {
  var lmModel = this.data.objects[objectIdx];
  if (!lmModel) {
    return null;
  }

  var lmPart = lmModel.parts[partIdx];
  if (!lmPart) {
    return null;
  }

  var lmData = new LightmapManager.Data();
  lmData.objectsPerRow = lmPart.objectsPerRow;
  lmData.objectIndex = lmPart.objectIndex;
  lmData.texture = this._getTexture(lmPart.lightmapIndex);
  return lmData;
};

/**
 * Loads and caches the texture referenced by the lightmap data.
 *
 * @param {number} textureIdx
 * @returns {THREE.Texture}
 * @private
 */
LightmapManager.prototype._getTexture = function(textureIdx) {
  var foundTexture = this.textures[textureIdx];
  if (foundTexture) {
    return foundTexture;
  }

  var newTexture = TextureManager.load(this.data.textures[textureIdx]);
  newTexture.wrapS = THREE.ClampToEdgeWrapping;
  newTexture.wrapT = THREE.ClampToEdgeWrapping;
  this.textures[textureIdx] = newTexture;
  return newTexture;
};

module.exports = LightmapManager;
