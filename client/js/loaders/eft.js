var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {String} name
 * @property {Boolean} soundEnabled
 * @property {String} soundPath
 * @property {Number} loopCount
 * @property {EffectData.Particle[]} particles
 * @property {EffectData.Animation[]} animations
 */
var EffectData = function() {
  this.particles  = [];
  this.animations = [];
};


/**
 * @constructor
 * @property {Boolean} enabled
 * @property {String} name
 * @property {Number} loopCount
 * @property {Number} index
 */
EffectData.AnimationData = function() {
};


/**
 * @constructor
 * @property {String} name
 * @property {String} uid
 * @property {Number} stbIndex
 * @property {String} particlePath
 * @property {EffectData.AnimationData} animation
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} rotation
 * @property {Number} delay
 * @property {Boolean} linkRoot
 */
EffectData.Particle = function() {
  this.animation = {};
};


/**
 * @constructor
 * @property {String} name
 * @property {String} uid
 * @property {Number} stbIndex
 * @property {String} meshPath
 * @property {String} animationPath
 * @property {String} texturePath
 * @property {Boolean} alphaEnabled
 * @property {Boolean} twoSideEnabled
 * @property {Boolean} alphaTestEnabled
 * @property {Boolean} depthTestEnabled
 * @property {Boolean} depthWriteEnabled
 * @property {Number} blendSrc
 * @property {Number} blendDst
 * @property {Number} blendOp
 * @property {EffectData.AnimationData} animation
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} rotation
 * @property {Number} delay
 * @property {Number} loopCount
 * @property {Boolean} linkRoot
 */
EffectData.Animation = function() {
  this.animation = new EffectData.AnimationData();
};


/*
 +D3DXQUATERNION* WINAPI D3DXQuaternionRotationYawPitchRoll(D3DXQUATERNION *pout, FLOAT yaw, FLOAT pitch, FLOAT roll)
 +{
 +    pout->x = sin( yaw / 2.0f) * cos(pitch / 2.0f) * sin(roll / 2.0f) + cos(yaw / 2.0f) * sin(pitch / 2.0f) * cos(roll / 2.0f);
 +    pout->y = sin( yaw / 2.0f) * cos(pitch / 2.0f) * cos(roll / 2.0f) - cos(yaw / 2.0f) * sin(pitch / 2.0f) * sin(roll / 2.0f);
 +    pout->z = cos(yaw / 2.0f) * cos(pitch / 2.0f) * sin(roll / 2.0f) - sin( yaw / 2.0f) * sin(pitch / 2.0f) * cos(roll / 2.0f);
 +    pout->w = cos( yaw / 2.0f) * cos(pitch / 2.0f) * cos(roll / 2.0f) + sin(yaw / 2.0f) * sin(pitch / 2.0f) * sin(roll / 2.0f);
 +    return pout;
 +}
 */
function D3DXQuaternionRotationYawPitchRoll(yaw, pitch, roll) {
  var x = Math.sin( yaw / 2.0) * Math.cos(pitch / 2.0) * Math.sin(roll / 2.0) + Math.cos(yaw / 2.0) * Math.sin(pitch / 2.0) * Math.cos(roll / 2.0);
  var y = Math.sin( yaw / 2.0) * Math.cos(pitch / 2.0) * Math.cos(roll / 2.0) - Math.cos(yaw / 2.0) * Math.sin(pitch / 2.0) * Math.sin(roll / 2.0);
  var z = Math.cos(yaw / 2.0) * Math.cos(pitch / 2.0) * Math.sin(roll / 2.0) - Math.sin( yaw / 2.0) * Math.sin(pitch / 2.0) * Math.cos(roll / 2.0);
  var w = Math.cos( yaw / 2.0) * Math.cos(pitch / 2.0) * Math.cos(roll / 2.0) + Math.sin(yaw / 2.0) * Math.sin(pitch / 2.0) * Math.sin(roll / 2.0);

  return new THREE.Quaternion(x, y, z, w);
}

/**
 * @callback Effect~onLoad
 * @param {Effect} effect
 */

/**
 * @param {String} path
 * @param {Effect~onLoad} callback
 */
EffectData.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var animations, data, i, particles;

    data = new EffectData();
    data.name         = rh.readUint32Str();
    data.soundEnabled = (rh.readUint32() & 0xff) !== 0;
    data.soundPath    = rh.readUint32Str();
    data.soundLoopCount    = rh.readUint32();

    particles = rh.readUint32();
    for (i = 0; i < particles; ++i) {
      var particle = new EffectData.Particle();
      particle.name                 = rh.readUint32Str();
      particle.uid                  = rh.readUint32Str();
      particle.stbIndex             = rh.readUint32();
      particle.particlePath         = rh.readUint32Str();
      particle.animation.enabled    = rh.readUint32() !== 0;
      particle.animation.path       = rh.readUint32Str();
      particle.animation.loopCount  = rh.readUint32();
      particle.animation.index      = rh.readUint32();
      particle.position             = rh.readVector3();
      particle.rotation             = rh.readQuat();
      particle.rotation = D3DXQuaternionRotationYawPitchRoll(particle.rotation.x, particle.rotation.y, particle.rotation.z);
      particle.delay                = rh.readUint32();
      particle.linkRoot             = rh.readUint32() !== 0;
      particle.position.multiplyScalar(ZZ_SCALE_IN);
      if (!particle.animation.path || particle.animation.path === 'NULL') {
        particle.animation.enabled = false;
      }
      data.particles.push(particle);
    }

    animations = rh.readUint32();
    for (i = 0; i < animations; ++i) {
      var animation = new EffectData.Animation();
      animation.name                = rh.readUint32Str();
      animation.uid                 = rh.readUint32Str();
      animation.stbIndex            = rh.readUint32();
      animation.meshPath            = rh.readUint32Str();
      animation.animationPath       = rh.readUint32Str();
      animation.texturePath         = rh.readUint32Str();
      animation.alphaEnabled        = rh.readUint32() !== 0;
      animation.twoSideEnabled      = rh.readUint32() !== 0;
      animation.alphaTestEnabled    = rh.readUint32() !== 0;
      animation.depthTestEnabled    = rh.readUint32() !== 0;
      animation.depthWriteEnabled   = rh.readUint32() !== 0;
      animation.blendSrc            = rh.readUint32();
      animation.blendDst            = rh.readUint32();
      animation.blendOp             = rh.readUint32();
      animation.animation.enabled   = rh.readUint32() !== 0;
      animation.animation.path      = rh.readUint32Str();
      animation.animation.loopCount = rh.readUint32();
      animation.animation.index     = rh.readUint32();
      animation.position            = rh.readVector3();
      animation.rotation            = rh.readQuat();
      animation.rotation = D3DXQuaternionRotationYawPitchRoll(animation.rotation.x, animation.rotation.y, animation.rotation.z);
      animation.delay               = rh.readUint32();
      animation.loopCount           = rh.readUint32();
      animation.linkRoot            = rh.readUint32() !== 0;
      animation.position.multiplyScalar(ZZ_SCALE_IN);
      if (animation.animationPath === 'NULL') {
        animation.animationPath = null;
      }
      if (!animation.animation.path || animation.animation.path === 'NULL') {
        animation.animation.path = null;
        animation.animation.enabled = false;
      }
      data.animations.push(animation);
    }

    callback(data);
  });
};

module.exports = EffectData;
