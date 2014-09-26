'use strict';

/**
 * @constructor
 */
var EffectManager = function()
{
};

EffectManager._createEmitter = function(data)
{
  var emitter = new ParticleEmitter();

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
  emitter.texture = TextureManager.load(data.texturePath);
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
      case ParticleSystemData.EVENT_TYPE.SIZE:
        event.size = eventData.size;
        break;
      case ParticleSystemData.EVENT_TYPE.TIMER:
        event.timer = eventData.timer;
        break;
      case ParticleSystemData.EVENT_TYPE.RED:
        event.red = eventData.red;
        break;
      case ParticleSystemData.EVENT_TYPE.GREEN:
        event.green = eventData.green;
        break;
      case ParticleSystemData.EVENT_TYPE.BLUE:
        event.blue = eventData.blue;
        break;
      case ParticleSystemData.EVENT_TYPE.ALPHA:
        event.alpha = eventData.alpha;
        break;
      case ParticleSystemData.EVENT_TYPE.COLOR:
        event.color = eventData.color;
        break;
      case ParticleSystemData.EVENT_TYPE.VELOCITY_X:
        event.velocityX = eventData.velocityX;
        break;
      case ParticleSystemData.EVENT_TYPE.VELOCITY_Y:
        event.velocityY = eventData.velocityY;
        break;
      case ParticleSystemData.EVENT_TYPE.VELOCITY_Z:
        event.velocityZ = eventData.velocityZ;
        break;
      case ParticleSystemData.EVENT_TYPE.VELOCITY:
        event.velocity = eventData.velocity;
        break;
      case ParticleSystemData.EVENT_TYPE.TEXTURE:
        event.textureIndex = eventData.textureIndex;
        break;
      case ParticleSystemData.EVENT_TYPE.ROTATION:
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

/**
 * @constructor
 */
var Effect = function(rootObj)
{
  this.rootObj  = new THREE.Object3D();
  this.rootObj2 = new THREE.Object3D();

  this.particleEffects = [];
  this.animations =[];
};

Effect.prototype.resetBlendWeights = function() {
  // Needed for THREE.AnimationHandler
};

Effect.prototype.play = function() {
  THREE.AnimationHandler.play(this);

  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].play();
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].play();
  }
};

Effect.prototype.stop = function() {
  THREE.AnimationHandler.stop(this);

  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].stop();
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].stop();
  }
};

Effect.prototype.update = function(delta) {
  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].update(delta);
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].update(delta);
  }
};

Effect.STATE = {
  READY_TO_PLAY: 0,
  PLAYING: 1,
  STOPPED: 2
};

/**
 * @constructor
 */
var ParticleEffect = function()
{
  this.rootObj = new THREE.Object3D();
  this.emitters = [];
  this.startDelay = 0;
  this.animation = null;
  this.state = Effect.STATE.READY_TO_PLAY;
};

ParticleEffect.prototype.play = function() {
  // Initialise stuff to play
};

ParticleEffect.prototype.stop = function() {
  // Make shit stop
};

ParticleEffect.prototype.update = function(delta) {
  if (this.state === Effect.STATE.READY_TO_PLAY) {
    this.startDelay -= delta;

    if (this.startDelay < 0) {
      this.state = Effect.STATE.PLAYING;

      if (this.animation) {
        this.animation.play();
      }

      delta = -this.startDelay;
    }
  }

  if (this.state === Effect.STATE.PLAYING) {
    for (var i = 0; i < this.emitters.length; ++i) {
      this.emitters[i].update(delta);
    }
  }
};

EffectManager._loadParticleEffect = function(path, callback) {
  var effect = new ParticleEffect();
  effect.path = path;

  ParticleSystemData.load(path, function(particleSystem) {
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

EffectManager._loadMeshAnimation = function(data, callback) {
  var animation = new Effect.Animation();
  var texture = TextureManager.load(data.texturePath);

  // Set animation properties
  animation.name = data.name;

  // Create material
  var material = ShaderManager.get('partmesh').clone();

  material.uniforms = {
    texture1: { type: 't', value: texture }
  };

  material.transparent   = true;
  material.depthTest     = data.depthTestEnabled;
  material.depthWrite    = data.depthWriteEnabled;
  material.blending      = THREE.CustomBlending;
  material.blendEquation = convertZnzinBlendOp(data.blendOp);
  material.blendSrc      = convertZnzinBlendType(data.blendSrc);
  material.blendDst      = convertZnzinBlendType(data.blendDst);

  if (data.twoSideEnabled) {
    material.side = THREE.DoubleSide;
  }

  if (data.alphaEnabled) {
    if (data.alphaTestEnabled) {
      material.alphaTest = 0.5;
    }
  }

  // TODO: Remove this once Three.js properly copies the default attribs.
  material.defaultAttributeValues['alpha'] = 1;

  Mesh.load(data.meshPath, function(geometry) {
    animation.mesh = new THREE.Mesh(geometry, animation.material);

    // ROSE, you suck...
    if (data.animationPath && data.animationPath !== 'NULL') {
      AnimationData.load(data.animationPath, function (animData) {
        animation.meshAnimation = new GeometryAnimator(geometry, animData);
        callback();
      });
    } else {
      callback();
    }
  });

  return animation;
};

/**
 * @constructor
 */
Effect.Animation = function() {
  this.rootObj = new THREE.Object3D();
  this.state = Effect.STATE.READY_TO_PLAY;
  this.startDelay = 0;
  this.animation = null;
  this.material = null;
  this.mesh = null;
  this.meshAnimation = null;
};

Effect.Animation.prototype.play = function() {
  // Initialise stuff to play
};

Effect.Animation.prototype.stop = function() {
  // Make shit stop
};

Effect.Animation.prototype.update = function(delta) {
  if (this.state === Effect.STATE.READY_TO_PLAY) {
    this.startDelay -= delta;

    if (this.startDelay < 0) {
      this.state = Effect.STATE.PLAYING;

      if (this.animation) {
        this.animation.play();
      }

      if (this.meshAnimation) {
        this.meshAnimation.play();
      }

      delta = -this.startDelay;
    }
  }

  // Check loopCount related shit
};

EffectManager.loadEffectByIdx = function(index, callback) {
  var effect = new Effect();

  GDM.get('file_effect', function (effectFileTable) {
    var effectRow = effectFileTable.row(index);
    EffectManager.loadEffect(effectRow[1], callback, effect);
  });

  return effect;
};

EffectManager.loadEffect = function(path, callback, effect) {
  var waitAll = new MultiWait();
  var effectWait = waitAll.one();
  effect = effect || new Effect();

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
      particle.startDelay = data.delay / 1000;
      particle.rootObj.position.copy(data.position);
      particle.rootObj.quaternion.copy(data.rotation);

      if (data.linkRoot) {
        effect.rootObj.add(particle.rootObj);
      } else {
        effect.rootObj2.add(particle.rootObj);
      }

      if (data.animation.enabled) {
        if (data.animation.name && data.animation.name !== "NULL") {
          (function(_particle, _data) {
            var particleAnimWait = waitAll.one();
            AnimationData.load(data.animation.name, function (animData)
            {
              _particle.animation = new ObjectAnimator(_particle.rootObj, animData);
              _particle.animationLoopCount = _data.animation.loopCount;
              particleAnimWait();
            });
          })(particle, data);
        }
      }

      effect.particleEffects.push(particle);
    }

    for (var i = 0; i < effectData.animations.length; ++i) {
      var data = effectData.animations[i];
      var meshAnimation = EffectManager._loadMeshAnimation(data, waitAll.one());

      // Set initial properties
      meshAnimation.startDelay = data.delay / 1000;
      meshAnimation.loopCount = data.loopCount;
      meshAnimation.rootObj.position.copy(data.position);
      meshAnimation.rootObj.quaternion.copy(data.rotation);

      if (data.linkRoot) {
        effect.rootObj.add(meshAnimation.rootObj);
      } else {
        effect.rootObj2.add(meshAnimation.rootObj);
      }

      if (data.animation.enabled) {
        if (data.animation.name && data.animation.name !== "NULL") {
          (function(_meshAnimation, _data) {
            var meshAnimationWait = waitAll.one();
            AnimationData.load(data.animation.name, function (animData) {
              _meshAnimation.animation = new ObjectAnimator(_meshAnimation.rootObj, animData);
              _meshAnimation.animationLoopCount = _data.animation.loopCount;
              meshAnimationWait();
            });
          })(meshAnimation, data);
        }
      }

      effect.animations.push(meshAnimation);
    }

    effectWait();
  });

  waitAll.wait(callback);
  return effect;
};
