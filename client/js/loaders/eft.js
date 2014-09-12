var EFT = {};

EFT.Effect = function() {
  this.particles = [];
  this.animations = [];
};

EFT.Particle = function() {
  this.animation = {};
};

EFT.Animation = function() {
  this.animation = {};
};

EFT.Loader = {};
EFT.Loader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var effect = new EFT.Effect();
    effect.name         = rh.readUint32Str();
    effect.soundPath    = rh.readUint32Str();
    effect.loopCount    = rh.readUint32();

    var particles = rh.readUint32();
    for (var i = 0; i < particles; ++i) {
      var particle = new EFT.Particle();
      particle.name                 = rh.readUint32Str();
      particle.uid                  = rh.readUint32Str();
      particle.stbIndex             = rh.readUint32();
      particle.filePath             = rh.readUint32Str();
      particle.animation.enabled    = !!rh.readUint32();
      particle.animation.name       = rh.readUint32Str();
      particle.animation.loopCount  = rh.readUint32();
      particle.animation.index      = rh.readUint32();
      particle.position             = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      particle.rotation             = rh.readQuat();
      particle.delay                = rh.readUint32();
      particle.linkRoot             = !!rh.readUint32();
      effect.particles.push(particle);
    }

    var animations = rh.readUint32();
    for (var j = 0; j < animations; ++j) {
      var animation = new EFT.Animation();
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
      animation.position            = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      animation.rotation            = rh.readQuat();
      animation.delay               = rh.readUint32();
      animation.loopCount           = rh.readUint32();
      animation.linkRoot            = !!rh.readUint32();
      effect.animations.push(animation);
    }
  });
};
