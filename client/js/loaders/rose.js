// TODO: Fix these
global.ROSE_DATA_PATH = config.dataPath ? config.dataPath : '/data/';

global.ZZ_SCALE_IN = 0.01;
global.ZZ_SCALE_OUT = 100;
global.ZZ_TICK_PER_SEC = 4800;

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
    // Check for errors.
    var normPath = normalizePath(path);
    if (normPath !== path) {
      //console.warn('Unnormalized path used.', path);
      path = normPath;
    }

    var loader = new THREE.XHRLoader();
    loader.setResponseType('arraybuffer');
    loader.load(ROSE_DATA_PATH + path, function (buffer) {
      callback(new BinaryReader(buffer));
    });
  };

}

global.ZZ_BLEND = {
  ZERO: 1,
  ONE: 2,
  SRC_COLOR: 3,
  INV_SRC_COLOR: 4,
  SRC_ALPHA: 5,
  INV_SRC_ALPHA: 6,
  DEST_ALPHA: 7,
  INV_DEST_ALPHA: 8,
  DEST_COLOR: 9,
  INV_DEST_COLOR: 10,
  SRC_ALPHA_SAT: 11,
  BOTH_SRC_ALPHA: 12,
  BOTH_INV_SRC_ALPHA: 13,
  BLEND_FACTOR: 14,
  INV_BLEND_FACTOR: 15
};

global.convertZnzinBlendType = function(znzin) {
  switch(znzin) {
    case ZZ_BLEND.ZERO:
      return THREE.ZeroFactor;
    case ZZ_BLEND.ONE:
      return THREE.OneFactor;
    case ZZ_BLEND.SRC_COLOR:
      return THREE.SrcColorFactor;
    case ZZ_BLEND.INV_SRC_COLOR:
      return THREE.OneMinusSrcColorFactor;
    case ZZ_BLEND.SRC_ALPHA:
      return THREE.SrcAlphaFactor;
    case ZZ_BLEND.INV_SRC_ALPHA:
      return THREE.OneMinusSrcAlphaFactor;
    case ZZ_BLEND.DEST_ALPHA:
      return THREE.DstAlphaFactor;
    case ZZ_BLEND.INV_DEST_ALPHA:
      return THREE.OneMinusDstAlphaFactor;
    case ZZ_BLEND.DEST_COLOR:
      return THREE.DstColorFactor;
    case ZZ_BLEND.INV_DEST_COLOR:
      return THREE.OneMinusDstColorFactor;
    case ZZ_BLEND.SRC_ALPHA_SAT:
      return THREE.SrcAlphaSaturateFactor;
  }

  console.warn('Encountered unknown d3d blending type:', znzin);
  return THREE.OneFactor;
};

global.ZZ_BLEND_OP = {
  ADD: 1,
  SUBTRACT: 2,
  REV_SUBTRACT: 3,
  MIN: 4,
  MAX: 5
};

global.convertZnzinBlendOp = function(znzin) {
  switch(znzin) {
    case ZZ_BLEND_OP.ADD:
      return THREE.AddEquation;
    case ZZ_BLEND_OP.SUBTRACT:
      return THREE.SubtractEquation;
    case ZZ_BLEND_OP.REV_SUBTRACT:
      return THREE.ReverseSubtractEquation;
  }

  if (renderer.supportsBlendMinMax()) {
    if (znzin === ZZ_BLEND_OP.MIN) {
      return THREE.MinEquation;
    } else if (znzin === ZZ_BLEND_OP.MAX) {
      return THREE.MaxEquation;
    }
  } else {
    if (znzin === ZZ_BLEND_OP.MIN || znzin === ZZ_BLEND_OP.MAX) {
      return THREE.AddEquation;
    }
  }

  console.warn('Encountered unknown d3d blending op:', znzin);
  return THREE.AddEquation;
};

module.exports = ROSELoader;
