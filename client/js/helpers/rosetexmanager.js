'use strict';

function _RoseTextureManager() {
  this.textures = {};
}

_RoseTextureManager.prototype.normalizePath = function(path) {
  return path;
};

_RoseTextureManager.prototype._load = function(path, callback) {
  var tex = DDS.load(path, function() {
    if (callback) {
      callback();
    }
  });
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  return tex;
};

_RoseTextureManager.prototype.load = function(path, callback) {
  var normPath = this.normalizePath(path);

  var foundTex = this.textures[normPath];
  if (foundTex) {
    if (callback) {
      callback();
    }
    return foundTex;
  }

  var newTex = this._load(path, callback);
  this.textures[normPath] = newTex;
  return newTex;
};

var RoseTextureManager = new _RoseTextureManager();
