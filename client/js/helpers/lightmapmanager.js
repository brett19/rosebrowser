'use strict';

function LightmapManager(data) {
  this.data = data;
  this.textures = {};
}

/**
 * This is a helper to allow a LightmapManager to be used by the DataManager.
 * @param path
 * @param callback
 */
LightmapManager.load = function(path, callback) {
  Lightmap.load(path, function(data) {
    callback(new LightmapManager(data));
  });
};

LightmapManager.prototype.getDataForPart = function(modelIdx, partIdx) {
  var lmModel = this.data.objects[modelIdx];
  if (!lmModel) {
    return null;
  }

  var lmPart = lmModel.parts[partIdx];
  if (!lmPart) {
    return null;
  }

  return {
    objectsPerRow: lmPart.objectsPerRow,
    objectIndex: lmPart.objectIndex,
    texture: this._getTexture(lmPart.lightmapIndex)
  };
};

LightmapManager.prototype._getTexture = function(textureIdx) {
  var foundTexture = this.textures[textureIdx];
  if (foundTexture) {
    return foundTexture;
  }

  var newTexture = TextureManager.load(this.data.textures[textureIdx]);
  this.textures[textureIdx] = newTexture;
  return newTexture;
};
