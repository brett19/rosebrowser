'use strict';

var ROSE_DATA_PATH = '/data/';

var ZZ_SCALE_IN = 0.01;
var ZZ_SCALE_OUT = 100;

var ROSELoader = {};

var EXPERIMENTAL_WS_LOAD = false;
if (EXPERIMENTAL_WS_LOAD) {

  var iopReqIdx = 1;
  var iopReqHandlers = {};
  iop.on('fr', function(reqIdx, data) {
    var callback = iopReqHandlers[reqIdx];
    if (callback) {
      callback(new BinaryReader(data));
      delete iopReqHandlers[reqIdx];
    }
  });
  ROSELoader.load = function(path, callback) {
    var thisReqIdx = iopReqIdx++;
    iopReqHandlers[thisReqIdx] = callback;
    iop.emit('fr', thisReqIdx, path);
  };

} else {

  ROSELoader.load = function(path, callback) {
    var loader = new THREE.XHRLoader();
    loader.setResponseType('arraybuffer');
    loader.load(ROSE_DATA_PATH + path, function (buffer) {
      callback(new BinaryReader(buffer));
    });
  };

}
