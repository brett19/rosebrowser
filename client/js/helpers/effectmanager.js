var EffectManager = function()
{
};

EffectManager._createEmitter = function(data)
{
  var emitter = new ParticleEmitter(data.name);

  // Set initial particle properties
  emitter.alignType      = data.alignType;
  emitter.coordType      = data.coordType;
  emitter.emitRate       = data.emitRate;
  emitter.emitRadius     = data.emitRadius;
  emitter.gravity        = data.gravity;
  emitter.lifeTime       = data.lifeTime;
  emitter.loopCount      = data.loopCount;
  emitter.particleCount  = data.particleCount;
  emitter.spawnDirection = data.spawnDirection;
  emitter.spriteCols     = data.spriteCols;
  emitter.spriteRows     = data.spriteRows;

  // Load texture
  emitter.texture = RoseTextureManager.load(data.texturePath);
  emitter.texture.repeat.set(1 / data.spriteCols, 1 / data.spriteRows);

  // Set material properties
  emitter.material = ShaderManager.get('particle').clone();
  emitter.material.uniforms = {
    texture1: {type: 't', value: null },
    uvScale:  {type: 'v2', value: new THREE.Vector2(1, 1)},
    uvOffset: {type: 'v2', value: new THREE.Vector2(0, 0)},
    vColor:   {type: 'c', value: new THREE.Color(0, 0, 0)},
    vAlpha:   {type: 'f', value: 1}
  };

  emitter.material.blending = THREE.CustomBlending;
  emitter.material.blendSrc = convertZnzinBlendType(data.blendSrc);
  emitter.material.blendDst = convertZnzinBlendType(data.blendDst);
  emitter.material.blendEquation = convertZnzinBlendOp(data.blendOp);

  // Set events
  for (var i = 0; i < data.events.length; ++i) {
    var eventData = data.events[i];
    var event = {
      time: eventData.time.getValueInRange(),
      type: eventData.type,
      fade: eventData.blended,
      fadeEvent: null
    };

    switch (event.type) {
      case ParticleSystem.EVENT_TYPE.SIZE:
        event.size = eventData.size;
        break;
      case ParticleSystem.EVENT_TYPE.TIMER:
        event.timer = eventData.timer;
        break;
      case ParticleSystem.EVENT_TYPE.RED:
        event.red = eventData.red;
        break;
      case ParticleSystem.EVENT_TYPE.GREEN:
        event.green = eventData.green;
        break;
      case ParticleSystem.EVENT_TYPE.BLUE:
        event.blue = eventData.blue;
        break;
      case ParticleSystem.EVENT_TYPE.ALPHA:
        event.alpha = eventData.alpha;
        break;
      case ParticleSystem.EVENT_TYPE.COLOR:
        event.color = eventData.color;
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_X:
        event.velocityX = eventData.velocityX;
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Y:
        event.velocityY = eventData.velocityY;
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Z:
        event.velocityZ = eventData.velocityZ;
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY:
        event.velocity = eventData.velocity;
        break;
      case ParticleSystem.EVENT_TYPE.TEXTURE:
        event.textureIndex = eventData.textureIndex;
        break;
      case ParticleSystem.EVENT_TYPE.ROTATION:
        event.rotation = eventData.rotation;
        break;
      default:
        throw 'Unexpected particle event type!';
    }

    emitter.events.push(event);
  }

  // Sort events
  emitter.events.sort(function(left, right) {
    return left.time - right.time;
  });

  // Link fade events
  for (var i = 0; i < emitter.events.length; ++i) {
    var event = emitter.events[i];

    for (var j = i + 1; j < emitter.events.length; ++j) {
      var other = emitter.events[j];

      if (other.fade && other.type === event.type) {
        event.fadeEvent = other;
        break;
      }
    }
  }

  return emitter;
};

var Effect = function(rootObj)
{
  this.rootObj  = new THREE.Object3D();
  this.rootObj2 = new THREE.Object3D();

  this.particleEffects = [];
  this.meshAnimations =[];
};

Effect.prototype.resetBlendWeights = function() {
  // Needed for THREE.AnimationHandler
};

Effect.prototype.play = function() {
  THREE.AnimationHandler.play(this);
};

Effect.prototype.stop = function() {
  THREE.AnimationHandler.stop(this);
};

Effect.prototype.update = function(delta) {
  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].update(delta);
  }
};

var ParticleEffect = function()
{
  this.rootObj = new THREE.Object3D();
  this.emitters = [];
  this.startDelay = 0;
};

ParticleEffect.prototype.update = function(delta) {
  for (var i = 0; i < this.emitters.length; ++i) {
    this.emitters[i].update(delta);
  }
};

EffectManager._loadParticleEffect = function(path, callback) {
  var effect = new ParticleEffect();
  effect.path = path;

  ParticleSystem.load(path, function(particleSystem) {
    for (var i = 0; i < particleSystem.emitters.length; ++i) {
      var emitter = EffectManager._createEmitter(particleSystem.emitters[i]);
      effect.emitters.push(emitter);
      effect.rootObj.add(emitter.rootObj);
    }

    if (callback) {
      callback();
    }
  });

  return effect;
};

EffectManager.loadEffect = function(path, callback) {
  var waitAll = new MultiWait();
  var effect = new Effect();

  EffectData.load(path, function (effectData) {
    effect.path = path;
    effect.loopCount = effectData.loopCount;

    effect.rootObj.name = effectData.name + ".rootObj";
    effect.rootObj2.name = effectData.name +  ".rootObj2";
    // TODO: Effect sound - data.soundEnabled, data.soundPath

    for (var i = 0; i < effectData.particles.length; ++i) {
      var data = effectData.particles[i];
      var particle = EffectManager._loadParticleEffect(data.particlePath, waitAll.one());

      // Set initial properties
      particle.startDelay = data.delay;
      particle.rootObj.position.copy(data.position);
      particle.rootObj.quaternion.copy(data.rotation);

      if (data.linkRoot) {
        effect.rootObj.add(particle.rootObj);
      } else {
        effect.rootObj2.add(particle.rootObj);
      }

      if (data.animation.enabled) {
        // TODO: Effect particle animation
        // Load data.animation.name
        // Apply to emitter.rootObj for loopCount
      }

      effect.particleEffects.push(particle);
    }

    for (var i = 0; i < effectData.animations.length; ++i) {
      // TODO: Effect mesh animations
    }
  });

  waitAll.wait(callback);
  return effect;
};

/*
 animations = rh.readUint32();
 for (i = 0; i < animations; ++i) {
   var animation = new Effect.Animation();
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
   animation.animation.name      = rh.readUint32Str();
   animation.animation.loopCount = rh.readUint32Str();
   animation.animation.index     = rh.readUint32();
   animation.position            = rh.readVector3();
   animation.rotation            = rh.readQuat();
   animation.rotation = D3DXQuaternionRotationYawPitchRoll(animation.rotation.x, animation.rotation.y, animation.rotation.z);
   animation.delay               = rh.readUint32();
   animation.loopCount           = rh.readUint32();
   animation.linkRoot            = rh.readUint32() !== 0;
   animation.position.multiplyScalar(ZZ_SCALE_IN);
   data.animations.push(animation);
 */