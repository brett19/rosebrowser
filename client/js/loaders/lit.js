var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {Object.<number,LightmapData.Object>} objects
 * @property {String[]} textures
 */
var LightmapData = function() {
  this.objects = {};
  this.textures = [];
};


/**
 * @constructor
 * @property {Number} id
 * @property {Object.<number,LightmapData.Object.Part>} parts
 */
LightmapData.Object = function() {
  this.parts = {};
};


/**
 * @constructor
 * @property {String} name
 * @property {Number} id
 * @property {String} filePath
 * @property {Number} lightmapIndex
 * @property {Number} pixelsPerObject
 * @property {Number} objectsPerRow
 * @property {Number} objectIndex
 */
LightmapData.Object.Part = function() {
};


/**
 * @callback Lightmap~onLoad
 * @param {LightmapData} lightmap
 */

/**
 * @param {String} path
 * @param {Lightmap~onLoad} callback
 */
LightmapData.load = function(path, callback) {
  var folderPath = path.substr(0, path.lastIndexOf('/') + 1);
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, objects, partsCount, textures;
    var data = new LightmapData();

    objects = rh.readUint32();
    for (i = 0; i < objects; ++i) {
      var object = new LightmapData.Object();

      partsCount     = rh.readUint32();
      var objectId = rh.readUint32() - 1;
      for (j = 0; j < partsCount; ++j) {
        var part = new LightmapData.Object.Part();
        part.name            = rh.readUint8Str();
        var partId           = rh.readUint32();
        part.filePath        = rh.readUint8Str();
        part.lightmapIndex   = rh.readUint32();
        part.pixelsPerObject = rh.readUint32();
        part.objectsPerRow   = rh.readUint32();
        part.objectIndex     = rh.readUint32();
        object.parts[partId] = part;
      }
      data.objects[objectId] = object;
    }

    textures = rh.readUint32();
    for (i = 0; i < textures; ++i) {
      var lmTexName = rh.readUint8Str();
      lmTexName = folderPath + lmTexName;
      data.textures.push(lmTexName);
    }

    callback(data);
  });
};

module.exports = LightmapData;
