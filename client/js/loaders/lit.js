/**
 * @constructor
 * @property {Lightmap.Object[]} objects
 * @property {String} textures
 */
var Lightmap = function() {
  this.objects = [];
  this.textures = [];
};


/**
 * @constructor
 * @property {Number} id
 * @property {Lightmap.Object.Part[]} parts
 */
Lightmap.Object = function() {
  this.parts = [];
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
Lightmap.Object.Part = function() {
};


/**
 * @callback Lightmap~onLoad
 * @param {Lightmap} lightmap
 */

/**
 * @param {String} path
 * @param {Lightmap~onLoad} callback
 */
Lightmap.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, objects, parts, textures;
    var data = new Lightmap();

    objects = rh.readUint32();
    for (i = 0; i < objects; ++i) {
      var object = new Lightmap.Object();

      parts     = rh.readUint32();
      object.id = rh.readUint32();
      for (j = 0; j < parts; ++j) {
        var part = new Lightmap.Object.Part();
        part.name            = rh.readUint8Str();
        part.id              = rh.readUint32();
        part.filePath        = rh.readUint8Str();
        part.lightmapIndex   = rh.readUint32();
        part.pixelsPerObject = rh.readUint32();
        part.objectsPerRow   = rh.readUint32();
        part.objectIndex     = rh.readUint32();
        object.parts.push(part);
      }

      data.objects.push(object);
    }

    textures = rh.readUint32();
    for (i = 0; i < textures; ++i) {
      data.textures.push(rh.readUint8Str());
    }

    callback(data);
  });
};
