
function HIMData() {
  this.width = 0;
  this.height = 0;
  this.map = [];
}
var HIMLoader = {};
HIMLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = new HIMData();
    data.width = b.readUint32();
    data.height = b.readUint32();
    /*patchGridCount*/ b.readUint32();
    /*patchSize*/ b.readFloat();
    for (var i = 0; i < data.width*data.height; ++i) {
      data.map.push(b.readFloat());
    }
    callback(data);
  });
};
