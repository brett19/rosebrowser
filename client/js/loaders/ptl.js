/**
 * @constructor
 * @property {ParticleSystem.Emitter[]} emitters
 */
var ParticleSystem = function() {
  this.emitters = [];
};


/**
 * Because THREE.Color is RGB only.
 *
 * @constructor
 * @param {Number} [r]
 * @param {Number} [g]
 * @param {Number} [b]
 * @param {Number} [a]
 * @property {Number} r
 * @property {Number} g
 * @property {Number} b
 * @property {Number} a
 */
var Color4 = function(r, g, b, a) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
  this.a = a || 0;
};

Color4.prototype.clone = function() {
  return new Color4(this.r, this.g, this.b, this.a);
};

Color4.prototype.add = function(color) {
  this.r += color.r;
  this.g += color.g;
  this.b += color.b;
  this.a += color.a;
  return this;
};

Color4.prototype.multiplyScalar = function(scalar) {
  this.r *= scalar;
  this.g *= scalar;
  this.b *= scalar;
  this.a *= scalar;
  return this;
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

RangeFloat.prototype.getValueInRange = function() {
  return Math.random() * (this.max - this.min) + this.min;
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

RangeVector2.prototype.getValueInRange = function() {
  var x = Math.random() * (this.max.x - this.min.x) + this.min.x;
  var y = Math.random() * (this.max.y - this.min.y) + this.min.y;
  return new THREE.Vector2(x, y);
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

RangeVector3.prototype.getValueInRange = function() {
  var x = Math.random() * (this.max.x - this.min.x) + this.min.x;
  var y = Math.random() * (this.max.y - this.min.y) + this.min.y;
  var z = Math.random() * (this.max.z - this.min.z) + this.min.z;
  return new THREE.Vector3(x, y, z);
};


/**
 * @constructor
 * @param {THREE.Vector3} [min]
 * @param {THREE.Vector3} [max]
 * @property {THREE.Vector3} min
 * @property {THREE.Vector3} max
 */
var RangeColor4 = function(min, max) {
  this.min = min || new Color4(0, 0, 0, 0);
  this.max = max || new Color4(0, 0, 0, 0);
};

RangeColor4.prototype.getValueInRange = function() {
  var r = Math.random() * (this.max.r - this.min.r) + this.min.r;
  var g = Math.random() * (this.max.g - this.min.g) + this.min.g;
  var b = Math.random() * (this.max.b - this.min.b) + this.min.b;
  var a = Math.random() * (this.max.a - this.min.a) + this.min.a;
  return new Color4(r, g, b, a);
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
 * @property {Number} alignType
 * @property {Number} coordType
 * @property {Number} textureWidth
 * @property {Number} textureHeight
 * @property {Number} drawType
 * @property {Number} blendDst
 * @property {Number} blendSrc
 * @property {Number} blendOp
 */
ParticleSystem.Emitter = function() {
  this.events         = [];
  this.lifeTime       = new RangeFloat();
  this.emitRate       = new RangeFloat();
  this.spawnDirection = new RangeVector3();
  this.emitRadius     = new RangeVector3();
  this.gravity        = new RangeVector3();
};


/**
 * @constructor
 * @param {ParticleSystem.EVENT_TYPE} type
 * @property {ParticleSystem.EVENT_TYPE} type
 * @property {RangeFloat} time
 * @property {Boolean} blended
 * @property {RangeVector2} size
 * @property {RangeFloat} timer
 * @property {RangeFloat} red
 * @property {RangeFloat} green
 * @property {RangeFloat} blue
 * @property {RangeFloat} alpha
 * @property {RangeColor} color
 * @property {RangeFloat} velocityX
 * @property {RangeFloat} velocityY
 * @property {RangeFloat} velocityZ
 * @property {RangeVector3} velocity
 * @property {RangeFloat} textureIndex
 * @property {RangeFloat} rotation
 */
ParticleSystem.Event = function(type) {
  this.type = type;
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystem.EVENT_TYPE = {
  NONE:       0,
  SIZE:       1,
  TIMER:      2,
  RED:        3,
  GREEN:      4,
  BLUE:       5,
  ALPHA:      6,
  COLOR:     7,
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
ParticleSystem.DRAW_TYPE = { // NOT USED
  POINT_SPRITE: 0,
  BILLBOARD: 1
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystem.COORD_TYPE = {
  WORLD: 0,       // Nothing inherited from parent
  LOCAL_WORLD: 1, // Position only inherited from parent
  LOCAL: 2        // Rotation and position inherited
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystem.ALIGN_TYPE = {
  BILLBOARD: 0,   // Faces the camera on xyz
  WORLD_MESH: 1,  // No alignment.
  AXIS_ALIGNED: 2 // This means only Z
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadSizeEvent = function(rh, evt) {
  var min = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  evt.size = new RangeVector2(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadTimerEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.timer = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadRedEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.red = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadGreenEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.green = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadBlueEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.blue = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadAlphaEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.alpha = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadColorEvent = function(rh, evt) {
  var min = rh.readColor4();
  var max = rh.readColor4();
  evt.color = new RangeColor4(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadVelocityXEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityX = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadVelocityYEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityY = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadVelocityZEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityZ = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadVelocityEvent = function(rh, evt) {
  var min = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  evt.velocity = new RangeVector3(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadTextureEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.textureIndex = new RangeFloat(min, max);
  return evt;
};

/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.Event} evt
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadRotationEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.rotation = new RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystem.EVENT_TYPE} type
 * @returns {ParticleSystem.Event}
 */
ParticleSystem.loadEvent = function(rh, type) {
  var timeMin = rh.readFloat();
  var timeMax = rh.readFloat();
  var blended = !!rh.readUint8();

  var evt      = new ParticleSystem.Event(type);
  evt.time     = new RangeFloat(timeMin, timeMax);
  evt.blended  = blended;

  switch (type) {
  case ParticleSystem.EVENT_TYPE.SIZE:
    evt = ParticleSystem.loadSizeEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.TIMER:
    evt = ParticleSystem.loadTimerEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.RED:
    evt = ParticleSystem.loadRedEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.GREEN:
    evt = ParticleSystem.loadGreenEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.BLUE:
    evt = ParticleSystem.loadBlueEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.ALPHA:
    evt = ParticleSystem.loadAlphaEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.COLOR:
    evt = ParticleSystem.loadColorEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.VELOCITY_X:
    evt = ParticleSystem.loadVelocityXEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.VELOCITY_Y:
    evt = ParticleSystem.loadVelocityYEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.VELOCITY_Z:
    evt = ParticleSystem.loadVelocityZEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.VELOCITY:
    evt = ParticleSystem.loadVelocityEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.TEXTURE:
    evt = ParticleSystem.loadTextureEvent(rh, evt);
    break;
  case ParticleSystem.EVENT_TYPE.ROTATION:
    evt = ParticleSystem.loadRotationEvent(rh, evt);
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
ParticleSystem.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, events, emitters, evt, type;
    var data = new ParticleSystem();

    emitters = rh.readUint32();
    for (i = 0; i < emitters; ++i) {
      var emitter = new ParticleSystem.Emitter();
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
      emitter.alignType           = rh.readUint32();
      emitter.coordType           = rh.readUint32();
      emitter.textureWidth        = rh.readUint32();
      emitter.textureHeight       = rh.readUint32();
      emitter.drawType            = rh.readUint32(); // Ignored by ZNZIN
      emitter.blendDst            = rh.readUint32();
      emitter.blendSrc            = rh.readUint32();
      emitter.blendOp             = rh.readUint32();

      events = rh.readUint32();
      for (j = 0; j < events; ++j) {
        type = rh.readUint32();
        evt  = ParticleSystem.loadEvent(rh, type);

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
