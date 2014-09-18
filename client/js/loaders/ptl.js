/**
 * @constructor
 * @property {Particle.Emitter[]} emitters
 */
var Particle = function() {
  this.emitters = [];
};


/**
 * Because THREE.Color is RGB only.
 *
 * @constructor
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @property {Number} r
 * @property {Number} g
 * @property {Number} b
 * @property {Number} a
 */
var Color4 = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};


/**
 * @constructor
 * @param {Number} [min]
 * @param {Number} [max]
 * @property {Number} min
 * @property {Number} max
 */
var RangeFloat = function(min, max) {
  this.min = min || 0;
  this.max = max || 0;
};


/**
 * @constructor
 * @param {THREE.Vector2} [min]
 * @param {THREE.Vector2} [max]
 * @property {THREE.Vector2} min
 * @property {THREE.Vector2} max
 */
var RangeVector2 = function(min, max) {
  this.min = min || new THREE.Vector2(0, 0);
  this.max = max || new THREE.Vector2(0, 0);
};


/**
 * @constructor
 * @param {THREE.Vector3} [min]
 * @param {THREE.Vector3} [max]
 * @property {THREE.Vector3} min
 * @property {THREE.Vector3} max
 */
var RangeVector3 = function(min, max) {
  this.min = min || new THREE.Vector3(0, 0, 0);
  this.max = max || new THREE.Vector3(0, 0, 0);
};


/**
 * @constructor
 * @param {THREE.Vector3} [min]
 * @param {THREE.Vector3} [max]
 * @property {THREE.Vector3} min
 * @property {THREE.Vector3} max
 */
var RangeColor4 = function(min, max) {
  this.min = min || new Color4(0, 0, 0);
  this.max = max || new Color4(0, 0, 0);
};


/**
 * @constructor
 * @property {String} name
 * @property {RangeFloat} lifeTime
 * @property {RangeFloat} emitRate
 * @property {Number} loopCount
 * @property {RangeVector3} spawnDirection
 * @property {RangeVector3} emitRadius
 * @property {RangeVector3} gravity
 * @property {String} texturePath
 * @property {Number} particleCount
 * @property {Number} alignment
 * @property {Number} updateCoordinate
 * @property {Number} textureWidth
 * @property {Number} textureHeight
 * @property {Number} drawType
 * @property {Number} blendDst
 * @property {Number} blendSrc
 * @property {Number} blendOp
 */
Particle.Emitter = function() {
  this.events         = [];
  this.lifeTime       = new RangeFloat();
  this.emitRate       = new RangeFloat();
  this.spawnDirection = new RangeVector3();
  this.emitRadius     = new RangeVector3();
  this.gravity        = new RangeVector3();
};


/**
 * @constructor
 * @param {Particle.EVENT_TYPE} type
 * @property {Particle.EVENT_TYPE} type
 * @property {RangeFloat} time
 * @property {Boolean} blended
 * @property {RangeVector2} size
 * @property {RangeFloat} timer
 * @property {RangeFloat} red
 * @property {RangeFloat} green
 * @property {RangeFloat} blue
 * @property {RangeFloat} alpha
 * @property {RangeColour} colour
 * @property {RangeFloat} velocityX
 * @property {RangeFloat} velocityY
 * @property {RangeFloat} velocityZ
 * @property {RangeVector3} velocity
 * @property {RangeFloat} textureIndex
 * @property {RangeFloat} rotation
 */
Particle.Event = function(type) {
  this.type = type;
};


/**
 * @enum {Number}
 * @readonly
 */
Particle.EVENT_TYPE = {
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


/**
 * @enum {Number}
 * @readonly
 */
Particle.DRAW_TYPE = {
  POINT_SPRITE: 0,
  BILLBOARD: 1
};


/**
 * @enum {Number}
 * @readonly
 */
Particle.COORD_TYPE = {
  WORLD: 0,
  LOCAL_WORLD: 1,
  LOCAL: 2
};


/**
 * @enum {Number}
 * @readonly
 */
Particle.ALIGN_TYPE = {
  BILLBOARD: 0,
  WORLD_MESH: 1,
  AXIS_ALIGNED: 2
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadSizeEvent = function(rh, evt) {
  var min = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  evt.size = new RangeVector2(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadTimerEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.timer = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadRedEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.red = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadGreenEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.green = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadBlueEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.blue = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadAlphaEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.alpha = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadColourEvent = function(rh, evt) {
  var min = rh.readColor4();
  var max = rh.readColor4();
  evt.colour = new RangeColor4(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadVelocityXEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityX = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadVelocityYEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityY = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadVelocityZEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityZ = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadVelocityEvent = function(rh, evt) {
  var min = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  evt.velocity = new RangeVector3(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadTextureEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.textureIndex = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.Event} evt
 * @returns {Particle.Event}
 */
Particle.loadRotationEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.rotation = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {Particle.EVENT_TYPE} type
 * @returns {Particle.Event}
 */
Particle.loadEvent = function(rh, type) {
  var timeMin = rh.readFloat();
  var timeMax = rh.readFloat();
  var blended = !!rh.readUint8();

  var evt      = new Particle.Event(type);
  evt.time     = new RangeFloat(timeMin, timeMax);
  evt.blended  = blended;

  switch (type) {
  case Particle.EVENT_TYPE.SIZE:
    evt = Particle.loadSizeEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.TIMER:
    evt = Particle.loadTimerEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.RED:
    evt = Particle.loadRedEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.GREEN:
    evt = Particle.loadGreenEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.BLUE:
    evt = Particle.loadBlueEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.ALPHA:
    evt = Particle.loadAlphaEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.COLOUR:
    evt = Particle.loadColourEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.VELOCITY_X:
    evt = Particle.loadVelocityXEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.VELOCITY_Y:
    evt = Particle.loadVelocityYEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.VELOCITY_Z:
    evt = Particle.loadVelocityZEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.VELOCITY:
    evt = Particle.loadVelocityEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.TEXTURE:
    evt = Particle.loadTextureEvent(rh, evt);
    break;
  case Particle.EVENT_TYPE.ROTATION:
    evt = Particle.loadRotationEvent(rh, evt);
    break;
  default:
    evt = null;
  }

  return evt;
};


/**
 * @callback Particle~onLoad
 * @param {Particle} particle
 */

/**
 * @param {String} path
 * @param {Particle~onLoad} callback
 */
Particle.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, events, emitters, evt, type;
    var data = new Particle();

    emitters = rh.readUint32();
    for (i = 0; i < emitters; ++i) {
      var emitter = new Particle.Emitter();
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

      events = rh.readUint32();
      for (j = 0; j < events; ++j) {
        type = rh.readUint32();
        evt  = Particle.loadEvent(rh, type);

        if (evt) {
          emitter.events.push(evt);
        } else {
          throw "Unexpected event type " + type + " in " + path;
        }
      }

      data.emitters.push(emitter);
    }

    callback(data);
  });
};
