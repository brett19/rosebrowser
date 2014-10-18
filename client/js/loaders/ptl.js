var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {ParticleSystemData.Emitter[]} emitters
 */
var ParticleSystemData = function() {
  this.emitters = [];
};


/**
 * @constructor
 * @param {Number} [min]
 * @param {Number} [max]
 * @property {Number} min
 * @property {Number} max
 */
ParticleSystemData.RangeFloat = function(min, max) {
  this.min = min || 0;
  this.max = max || 0;
};

ParticleSystemData.RangeFloat.prototype.getValueInRange = function() {
  return Math.random() * (this.max - this.min) + this.min;
};


/**
 * @constructor
 * @param {THREE.Vector2} [min]
 * @param {THREE.Vector2} [max]
 * @property {THREE.Vector2} min
 * @property {THREE.Vector2} max
 */
ParticleSystemData.RangeVector2 = function(min, max) {
  this.min = min || new THREE.Vector2(0, 0);
  this.max = max || new THREE.Vector2(0, 0);
};

ParticleSystemData.RangeVector2.prototype.getValueInRange = function() {
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
ParticleSystemData.RangeVector3 = function(min, max) {
  this.min = min || new THREE.Vector3(0, 0, 0);
  this.max = max || new THREE.Vector3(0, 0, 0);
};

ParticleSystemData.RangeVector3.prototype.getValueInRange = function() {
  var x = Math.random() * (this.max.x - this.min.x) + this.min.x;
  var y = Math.random() * (this.max.y - this.min.y) + this.min.y;
  var z = Math.random() * (this.max.z - this.min.z) + this.min.z;
  return new THREE.Vector3(x, y, z);
};


/**
 * @constructor
 * @param {Color4} [min]
 * @param {Color4} [max]
 * @property {Color4} min
 * @property {Color4} max
 */
ParticleSystemData.RangeColor4 = function(min, max) {
  this.min = min || new Color4(0, 0, 0, 0);
  this.max = max || new Color4(0, 0, 0, 0);
};

ParticleSystemData.RangeColor4.prototype.getValueInRange = function() {
  var r = Math.random() * (this.max.r - this.min.r) + this.min.r;
  var g = Math.random() * (this.max.g - this.min.g) + this.min.g;
  var b = Math.random() * (this.max.b - this.min.b) + this.min.b;
  var a = Math.random() * (this.max.a - this.min.a) + this.min.a;
  return new Color4(r, g, b, a);
};


/**
 * @constructor
 * @property {String} name
 * @property {ParticleSystemData.RangeFloat} lifeTime
 * @property {ParticleSystemData.RangeFloat} emitRate
 * @property {Number} loopCount
 * @property {ParticleSystemData.RangeVector3} spawnDirection
 * @property {ParticleSystemData.RangeVector3} emitRadius
 * @property {ParticleSystemData.RangeVector3} gravity
 * @property {String} texturePath
 * @property {Number} particleCount
 * @property {Number} alignType
 * @property {Number} coordType
 * @property {Number} spriteCols
 * @property {Number} spriteRows
 * @property {Number} drawType
 * @property {Number} blendDst
 * @property {Number} blendSrc
 * @property {Number} blendOp
 */
ParticleSystemData.Emitter = function() {
  this.events         = [];
  this.lifeTime       = new ParticleSystemData.RangeFloat();
  this.emitRate       = new ParticleSystemData.RangeFloat();
  this.spawnDirection = new ParticleSystemData.RangeVector3();
  this.emitRadius     = new ParticleSystemData.RangeVector3();
  this.gravity        = new ParticleSystemData.RangeVector3();
};


/**
 * @constructor
 * @param {ParticleSystemData.EVENT_TYPE} type
 * @property {ParticleSystemData.EVENT_TYPE} type
 * @property {ParticleSystemData.RangeFloat} time
 * @property {Boolean} blended
 * @property {ParticleSystemData.RangeVector2} size
 * @property {ParticleSystemData.RangeFloat} timer
 * @property {ParticleSystemData.RangeFloat} red
 * @property {ParticleSystemData.RangeFloat} green
 * @property {ParticleSystemData.RangeFloat} blue
 * @property {ParticleSystemData.RangeFloat} alpha
 * @property {ParticleSystemData.RangeColor4} color
 * @property {ParticleSystemData.RangeFloat} velocityX
 * @property {ParticleSystemData.RangeFloat} velocityY
 * @property {ParticleSystemData.RangeFloat} velocityZ
 * @property {ParticleSystemData.RangeVector3} velocity
 * @property {ParticleSystemData.RangeFloat} textureIndex
 * @property {ParticleSystemData.RangeFloat} rotation
 */
ParticleSystemData.Event = function(type) {
  this.type = type;
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystemData.EVENT_TYPE = {
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
ParticleSystemData.DRAW_TYPE = { // NOT USED
  POINT_SPRITE: 0,
  BILLBOARD: 1
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystemData.COORD_TYPE = {
  WORLD: 0,       // Nothing inherited from parent
  LOCAL_WORLD: 1, // Position only inherited from parent
  LOCAL: 2        // Start at parent position, do NOT move with it
};


/**
 * @enum {Number}
 * @readonly
 */
ParticleSystemData.ALIGN_TYPE = {
  BILLBOARD: 0,   // Faces the camera on xyz
  WORLD_MESH: 1,  // No alignment.
  AXIS_ALIGNED: 2 // This means only Z
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadSizeEvent = function(rh, evt) {
  var min = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector2().multiplyScalar(ZZ_SCALE_IN);
  evt.size = new ParticleSystemData.RangeVector2(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadTimerEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.timer = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadRedEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.red = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadGreenEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.green = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadBlueEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.blue = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadAlphaEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.alpha = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadColorEvent = function(rh, evt) {
  var min = rh.readColor4();
  var max = rh.readColor4();
  evt.color = new ParticleSystemData.RangeColor4(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadVelocityXEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityX = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadVelocityYEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityY = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadVelocityZEvent = function(rh, evt) {
  var min = rh.readFloat() * ZZ_SCALE_IN;
  var max = rh.readFloat() * ZZ_SCALE_IN;
  evt.velocityZ = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadVelocityEvent = function(rh, evt) {
  var min = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  var max = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  evt.velocity = new ParticleSystemData.RangeVector3(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadTextureEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.textureIndex = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};

/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.Event} evt
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadRotationEvent = function(rh, evt) {
  var min = rh.readFloat();
  var max = rh.readFloat();
  evt.rotation = new ParticleSystemData.RangeFloat(min, max);
  return evt;
};


/**
 * @param {BinaryReader} rh
 * @param {ParticleSystemData.EVENT_TYPE} type
 * @returns {ParticleSystemData.Event}
 */
ParticleSystemData.loadEvent = function(rh, type) {
  var timeMin = rh.readFloat();
  var timeMax = rh.readFloat();
  var blended = !!rh.readUint8();

  var evt      = new ParticleSystemData.Event(type);
  evt.time     = new ParticleSystemData.RangeFloat(timeMin, timeMax);
  evt.blended  = blended;

  switch (type) {
  case ParticleSystemData.EVENT_TYPE.SIZE:
    evt = ParticleSystemData.loadSizeEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.TIMER:
    evt = ParticleSystemData.loadTimerEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.RED:
    evt = ParticleSystemData.loadRedEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.GREEN:
    evt = ParticleSystemData.loadGreenEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.BLUE:
    evt = ParticleSystemData.loadBlueEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.ALPHA:
    evt = ParticleSystemData.loadAlphaEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.COLOR:
    evt = ParticleSystemData.loadColorEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.VELOCITY_X:
    evt = ParticleSystemData.loadVelocityXEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.VELOCITY_Y:
    evt = ParticleSystemData.loadVelocityYEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.VELOCITY_Z:
    evt = ParticleSystemData.loadVelocityZEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.VELOCITY:
    evt = ParticleSystemData.loadVelocityEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.TEXTURE:
    evt = ParticleSystemData.loadTextureEvent(rh, evt);
    break;
  case ParticleSystemData.EVENT_TYPE.ROTATION:
    evt = ParticleSystemData.loadRotationEvent(rh, evt);
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
ParticleSystemData.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, events, emitters, evt, type;
    var data = new ParticleSystemData();

    emitters = rh.readUint32();
    for (i = 0; i < emitters; ++i) {
      var emitter = new ParticleSystemData.Emitter();
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
      emitter.spriteCols          = rh.readUint32();
      emitter.spriteRows          = rh.readUint32();
      emitter.drawType            = rh.readUint32(); // Ignored by ZNZIN
      emitter.blendDst            = rh.readUint32();
      emitter.blendSrc            = rh.readUint32();
      emitter.blendOp             = rh.readUint32();

      events = rh.readUint32();
      for (j = 0; j < events; ++j) {
        type = rh.readUint32();
        evt  = ParticleSystemData.loadEvent(rh, type);

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

module.exports = ParticleSystemData;
