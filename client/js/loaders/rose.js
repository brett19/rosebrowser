var ROSE_DATA_PATH = '/data/';

var ZZ_SCALE_IN = 0.01;
var ZZ_SCALE_OUT = 100;

var ROSELoader = {};

ROSELoader.load = function(path, callback) {
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    callback(new BinaryReader(buffer));
  });
};
