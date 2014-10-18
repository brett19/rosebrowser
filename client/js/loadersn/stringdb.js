'use strict';

function StringDb(data) {
  this.data = data;
  this.count = this.data.getUint32(0);
}

StringDb.prototype.get = function(idx) {
  var offset = this.data.getUint32(4 + 4*idx);
  this.data.seek(offset);
  return this.data.readUint16Str();
};

StringDb.load = function(path, callback) {
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new StringDb(new RbReader(buffer));
    callback(null, out);
  });
};
