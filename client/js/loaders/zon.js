var ZON = {};

ZON.Zone = function() {
  this.spawns = [];
  this.textures = [];
  this.tiles = [];
};

ZON.SpawnPoint = function() {
};

ZON.Tile = function() {
};

ZON.BLOCK = {
  INFO:         0,
  SPAWN_POINTS: 1,
  TEXTURES:     2,
  TILES:        3,
  ECONOMY:      4
};

ZON.TILE_ROTATION = {
  NONE:                 0,
  FLIP_HORIZONTAL:      2,
  FLIP_VERTICAL:        3,
  FLIP_BOTH:            4,
  CLOCKWISE_90:         5,
  COUNTER_CLOCKWISE_90: 6
};

ZON.Loader = {};
ZON.Loader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var zone = new ZON.Zone();

    var blocks = rh.readUint32();
    for (var i = 0; i < blocks; ++i) {
      var type   = rh.readUint32();
      var offset = rh.readUint32();
      var pos    = rh.tell();

      switch(type) {
      case ZON.BLOCK.INFO:
        zone.type = rh.readUint32();
        zone.width = rh.readUint32();
        zone.height = rh.readUint32();
        zone.gridCount = rh.readUint32();
        zone.gridSize = rh.readFloat();
        zone.startX = rh.readUint32();
        zone.startY = rh.readUint32();
        // We don't care about the following position data
        break;
      case ZON.BLOCK.SPAWN_POINTS:
        var spawns = rh.readUint32();
        for (var j = 0; j < spawns; ++j) {
          var spawn = new ZON.SpawnPoint();
          spawn.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
          spawn.name = rh.readByteStr();
          zone.spawns.push(spawn);
        }
        break;
      case ZON.BLOCK.TEXTURES:
        var textures = rh.readUint32();
        for (var j = 0; j < textures; ++j) {
          zone.textures.push(rh.readByteStr());
        }
        break;
      case ZON.BLOCK.TILES:
        var tiles = rh.readUint32();
        for (var j = 0; j < tiles; ++j) {
          var tile = new ZON.Tile();
          tile.layer1  = rh.readUint32();
          tile.layer2  = rh.readUint32();
          tile.offset1 = rh.readUint32();
          tile.offset2 = rh.readUint32();
          tile.blend   = !!rh.readUint32();
          tile.rotation = rh.readUint32();
          tile.type = rh.readUint32();
          zone.tiles.push(tile);
        }
        break;
      case ZON.BLOCK.ECONOMY:
        zone.name                  = rh.readByteStr();
        zone.underground           = !!rh.readUint32();
        zone.backgroundMusicPath   = rh.readByteStr();
        zone.skyPath               = rh.readByteStr();
        // We don't care about the following economy data
        break;
      }
      rh.seek(pos);
    }
    callback(zone);
  });
};
