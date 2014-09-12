var PTL = {};

PTL.Particle = function() {
  this.emitters = [];
};

PTL.Emitter = function() {
  this.events = [];
};

PTL.Event = function() {
};

PTL.EVENT_TYPE = {
  NONE:       0,
  SIZE:       1,
  TIMER:      2,
  RED:        3,
  GREEN:      4,
  BLUE:       5,
  ALPHA:      6,
  COLOUR:     7,
  VELOCITY_X: 8,
  VELOCITY_Y: 9,
  VELOCITY_Z: 10,
  VELOCITY:   11,
  TEXTURE:    12,
  ROTATION:   13
};

PTL.DRAW_TYPE = {
  POINT_SPRITE: 0,
  BILLBOARD: 1
};

PTL.COORD_TYPE = {
  WORLD: 0,
  LOCAL_WORLD: 1,
  LOCAL: 2
};

PTL.ALIGN_TYPE = {
  BILLBOARD: 0,
  WORLD_MESH: 1,
  AXIS_ALIGNED: 2
};

PTL.Loader = {};
PTL.Loader.loadSizeEvent = function(rh) {
  var size = {};
  size.min = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  size.max = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  return size;
};

PTL.Loader.loadTimerEvent = function(rh) {
  var timer = {};
  timer.min = rh.readFloat();
  timer.max = rh.readFloat();
  return timer;
};

PTL.Loader.loadRedEvent = function(rh) {
  var red = {};
  red.min = rh.readFloat();
  red.max = rh.readFloat();
  return red;
};

PTL.Loader.loadGreenEvent = function(rh) {
  var green = {};
  green.min = rh.readFloat();
  green.max = rh.readFloat();
  return green;
};

PTL.Loader.loadBlueEvent = function(rh) {
  var blue = {};
  blue.min = rh.readFloat();
  blue.max = rh.readFloat();
  return blue;
};

PTL.Loader.loadAlphaEvent = function(rh) {
  var alpha = {};
  alpha.min = rh.readFloat();
  alpha.max = rh.readFloat();
  return alpha;
};

PTL.Loader.loadColourEvent = function(rh) {
  var colour = {};
  colour.min = rh.readColourRGBA();
  colour.max = rh.readColourRGBA();
  return colour;
};

PTL.Loader.loadVelocityXEvent = function(rh) {
  var velocityX = {};
  velocityX.min = rh.readFloat() * ZZ_SCALE_IN;
  velocityX.max = rh.readFloat() * ZZ_SCALE_IN;
  return velocityX;
};

PTL.Loader.loadVelocityYEvent = function(rh) {
  var velocityY = {};
  velocityY.min = rh.readFloat() * ZZ_SCALE_IN;
  velocityY.max = rh.readFloat() * ZZ_SCALE_IN;
  return velocityY;
};

PTL.Loader.loadVelocityZEvent = function(rh) {
  var velocityZ = {};
  velocityZ.min = rh.readFloat() * ZZ_SCALE_IN;
  velocityZ.max = rh.readFloat() * ZZ_SCALE_IN;
  return velocityZ;
};

PTL.Loader.loadVelocityEvent = function(rh) {
  var velocity = {};
  velocity.min = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  velocity.max = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  return velocity;
};

PTL.Loader.loadTextureEvent = function(rh) {
  var textureIndex = {};
  textureIndex.min = rh.readFloat();
  textureIndex.max = rh.readFloat();
  return textureIndex;
};

PTL.Loader.loadRotationEvent = function(rh) {
  var rotation = {};
  rotation.min = rh.readFloat();
  rotation.max = rh.readFloat();
  return rotation;
};

PTL.Loader.loadEvent = function(type, rh) {
  var evt = new PTL.Event(type);
  evt.time.min = rh.readFloat();
  evt.time.max = rh.readFloat();
  evt.blended  = !!rh.readUint8();

  switch (type) {
  case PTL.EVENT_TYPE.SIZE:
    evt = PTL.Loader.loadScaleEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.TIMER:
    evt = PTL.Loader.loadTimerEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.RED:
    evt = PTL.Loader.loadRedEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.GREEN:
    evt = PTL.Loader.loadGreenEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.BLUE:
    evt = PTL.Loader.loadBlueEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.ALPHA:
    evt = PTL.Loader.loadAlphaEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.COLOUR:
    evt = PTL.Loader.loadColourEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.VELOCITY_X:
    evt = PTL.Loader.loadVelocityXEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.VELOCITY_Y:
    evt = PTL.Loader.loadVelocityYEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.VELOCITY_Z:
    evt = PTL.Loader.loadVelocityZEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.VELOCITY:
    evt = PTL.Loader.loadVelocityEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.TEXTURE:
    evt = PTL.Loader.loadTextureEvent(evt, rh);
    break;
  case PTL.EVENT_TYPE.ROTATION:
    evt = PTL.Loader.loadRotationEvent(evt, rh);
    break;
  default:
    evt = null;
  }

  return evt;
};

PTL.Loader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var ptl = new PTL.Particle();

    var emitters = rh.readUint32();
    for (var i = 0; i < emitters; ++i) {
      var emitter = new PTL.Emitter();
      emitter.name                = rh.readUint32Str();
      emitter.lifeTime.min        = rh.readFloat();
      emitter.lifeTime.max        = rh.readFloat();
      emitter.emitRate.min        = rh.readFloat();
      emitter.emitRate.max        = rh.readFloat();
      emitter.loopCount           = rh.readUint32();
      emitter.spawnDirection.min  = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.spawnDirection.max  = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.emitRadius.min      = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.emitRadius.max      = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.gravity.min         = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.gravity.max         = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      emitter.texturePath         = rh.readUint32Str();
      emitter.particleCount       = rh.readUint32();
      emitter.alignment           = rh.readUint32();
      emitter.updateCoordinate    = rh.readUint32();
      emitter.textureWidth        = rh.readUint32();
      emitter.textureHeight       = rh.readUint32();
      emitter.drawType            = rh.readUint32(); // Ignored by ZNZIN
      emitter.blendDst            = rh.readUint32();
      emitter.blendSrc            = rh.readUint32();
      emitter.blendOp             = rh.readUint32();

      var events = rh.readUint32();
      for (var j = 0; j < events; ++j) {
        var type = rh.readUint32();
        var evt = this.loadEvent(type, rh);

        if (evt) {
          emitter.events.push(evt);
        } else {
          throw "Unexpected event type " + type + " in " + path;
        }
      }

      ptl.emitters.push(emitter);
    }

    callback(ptl);
  });
};
