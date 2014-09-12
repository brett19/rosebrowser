var ROSE_DATA_PATH = '/data/';

var ROSELoader = {};

ROSELoader.load = function(path, callback) {
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_BASE + path, function (buffer) {
    callback(new BinaryReader(buffer));
  });
};
