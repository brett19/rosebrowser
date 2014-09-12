/**
 * @constructor
 * @property {Effect.Particle[]} particles
 * @property {Effect.Animation[]} animations
 */
var Effect = function() {
  this.particles  = [];
  this.animations = [];
};

/**
 * @constructor
 */
Effect.Particle = function() {
  this.animation = {};
};

/**
 * @constructor
 */
Effect.Animation = function() {
  this.animation = {};
};

/**
 * @callback Effect~onLoad
 * @param {Effect} effect
 */

/**
 * @param {String} path
 * @param {Effect~onLoad} callback
 */
Effect.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var animations, data, i, particles;

    data = new Effect();
    data.name      = rh.readUint32Str();
    data.soundPath = rh.readUint32Str();
    data.loopCount = rh.readUint32();

    particles = rh.readUint32();
    for (i = 0; i < particles; ++i) {
      var particle = new Effect.Particle();
      particle.name                 = rh.readUint32Str();
      particle.uid                  = rh.readUint32Str();
      particle.stbIndex             = rh.readUint32();
      particle.filePath             = rh.readUint32Str();
      particle.animation.enabled    = !!rh.readUint32();
      particle.animation.name       = rh.readUint32Str();
      particle.animation.loopCount  = rh.readUint32();
      particle.animation.index      = rh.readUint32();
      particle.position             = rh.readVector3();
      particle.rotation             = rh.readQuat();
      particle.delay                = rh.readUint32();
      particle.linkRoot             = !!rh.readUint32();
      particle.position.multiplyScalar(ZZ_SCALE_IN);
      data.particles.push(particle);
    }

    animations = rh.readUint32();
    for (i = 0; i < animations; ++i) {
      var animation = new Effect.Animation();
      animation.name                = rh.readUint32Str();
      animation.uid                 = rh.readUint32Str();
      animation.stbIndex            = rh.readUint32();
      animation.meshPath            = rh.readUint32Str();
      animation.animationPath       = rh.readUint32Str();
      animation.texturePath         = rh.readUint32Str();
      animation.alphaEnabled        = !!rh.readUint32();
      animation.twoSideEnabled      = !!rh.readUint32();
      animation.alphaTestEnabled    = !!rh.readUint32();
      animation.depthTestEnabled    = !!rh.readUint32();
      animation.depthWriteEnabled   = !!rh.readUint32();
      animation.blendSrc            = rh.readUint32();
      animation.blendDst            = rh.readUint32();
      animation.blendOp             = rh.readUint32();
      animation.animation.enabled   = !!rh.readUint32();
      animation.animation.name      = rh.readUint32Str();
      animation.animation.loopCount = rh.readUint32Str();
      animation.animation.index     = rh.readUint32();
      animation.position            = rh.readVector3();
      animation.rotation            = rh.readQuat();
      animation.delay               = rh.readUint32();
      animation.loopCount           = rh.readUint32();
      animation.linkRoot            = !!rh.readUint32();
      animation.position.multiplyScalar(ZZ_SCALE_IN);
      data.animations.push(animation);
    }

    callback(data);
  });
};
