var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {String} name
 * @property {Number} type
 * @property {Number} width
 * @property {Number} height
 * @property {Number} gridCount
 * @property {Number} gridSize
 * @property {Number} startX
 * @property {Number} startY
 * @property {Boolean} underground
 * @property {String} backgroundMusicPath
 * @property {String} skyPath
 * @property {ZoneData.SpawnPoint[]} spawns
 * @property {ZoneData.Tile[]} tiles
 * @property {String[]} textures
 */
var ZoneData = function() {
  this.spawns = [];
  this.tiles = [];
  this.textures = [];
};


/**
 * @constructor
 * @property {THREE.Vector3} position
 * @property {String} name
 */
ZoneData.SpawnPoint = function() {
};


/**
 * @constructor
 * @property {Number} layer1
 * @property {Number} layer2
 * @property {Number} offset1
 * @property {Number} offset2
 * @property {Boolean} blend
 * @property {ZoneData.TILE_ROTATION} rotation
 * @property {Number} type
 */
ZoneData.Tile = function() {
};


/**
 * @enum {Number}
 * @readonly
 */
ZoneData.BLOCK = {
  INFO:         0,
  SPAWN_POINTS: 1,
  TEXTURES:     2,
  TILES:        3,
  ECONOMY:      4
};


/**
 * @enum {Number}
 * @readonly
 */
ZoneData.TILE_ROTATION = {
  NONE:                 0,
  FLIP_HORIZONTAL:      2,
  FLIP_VERTICAL:        3,
  FLIP_BOTH:            4,
  CLOCKWISE_90:         5,
  COUNTER_CLOCKWISE_90: 6
};


/**
 * @callback Zone~onLoad
 * @param {ZoneData} zone
 */

/**
 * @param {String} path
 * @param {Zone~onLoad} callback
 */
ZoneData.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var blocks, i, j, data;
    data = new ZoneData();

    blocks = rh.readUint32();
    for (i = 0; i < blocks; ++i) {
      var type, offset, pos, count;
      type   = rh.readUint32();
      offset = rh.readUint32();
      pos    = rh.tell();

      rh.seek(offset);
      switch(type) {
      case ZoneData.BLOCK.INFO:
        data.type      = rh.readUint32();
        data.width     = rh.readUint32();
        data.height    = rh.readUint32();
        data.gridCount = rh.readUint32();
        data.gridSize  = rh.readFloat();
        data.startX    = rh.readUint32();
        data.startY    = rh.readUint32();
        break;
      case ZoneData.BLOCK.SPAWN_POINTS:
        count = rh.readUint32();
        for (j = 0; j < count; ++j) {
          var spawn = new ZoneData.SpawnPoint();
          spawn.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
          spawn.name     = rh.readUint8Str();
          data.spawns.push(spawn);
        }
        break;
      case ZoneData.BLOCK.TEXTURES:
        count = rh.readUint32();
        for (j = 0; j < count; ++j) {
          data.textures.push(rh.readUint8Str());
        }
        break;
      case ZoneData.BLOCK.TILES:
        count = rh.readUint32();
        for (j = 0; j < count; ++j) {
          var tile = new ZoneData.Tile();
          tile.layer1   = rh.readUint32();
          tile.layer2   = rh.readUint32();
          tile.offset1  = rh.readUint32();
          tile.offset2  = rh.readUint32();
          tile.blend    = rh.readUint32() !== 0;
          tile.rotation = rh.readUint32();
          tile.type     = rh.readUint32();
          data.tiles.push(tile);
        }
        break;
      case ZoneData.BLOCK.ECONOMY:
        data.name                = rh.readUint8Str();
        data.underground         = rh.readUint32() !== 0;
        data.backgroundMusicPath = rh.readUint8Str();
        data.skyPath             = rh.readUint8Str();
        break;

      default:
        console.warn('Encountered unknown ZON block type:', type);
        break;
      }
      rh.seek(pos);
    }
    callback(data);
  });
};

module.exports = ZoneData;
