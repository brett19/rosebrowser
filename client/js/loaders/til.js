var TIL = {};

TIL.Tile = function() {
};

TIL.TileMap = function() {
  this.map = [];
};

TIL.Loader = {};
TIL.Loader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var tilemap = new TIL.TileMap();

    tilemap.width  = rh.readUint32();
    tilemap.height = rh.readUint32();

    for (var i = 0; i < tilemap.width * tilemap.height; ++i) {
      var tile = new TIL.Tile();
      tile.brush  = rh.readUint8();
      tile.index  = rh.readUint8();
      tile.set    = rh.readUint8();
      tile.number = rh.readUint32();
      tilemap.map.push(tile);
    }

    callback(tilemap);
  });
};
