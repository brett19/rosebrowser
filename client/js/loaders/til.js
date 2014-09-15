/**
 * @constructor
 * @property {Number} width
 * @property {Number} height
 * @property {Tilemap.Tile[]} map
 */
var Tilemap = function() {
  this.map = [];
};


/**
 * @constructor
 * @property {Number} brush
 * @property {Number} index
 * @property {Number} set
 * @property {Number} number
 */
Tilemap.Tile = function() {
};


/**
 * @callback Tilemap~onLoad
 * @param {Tilemap} tilemap
 */

/**
 * @param {String} path
 * @param {Tilemap~onLoad} callback
 */
Tilemap.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var data = new Tilemap();
    data.width  = rh.readUint32();
    data.height = rh.readUint32();

    for (var i = 0; i < data.width * data.height; ++i) {
      var tile = new Tilemap.Tile();
      tile.brush  = rh.readUint8();
      tile.index  = rh.readUint8();
      tile.set    = rh.readUint8();
      tile.number = rh.readUint32();
      data.map.push(tile);
    }

    callback(data);
  });
};
