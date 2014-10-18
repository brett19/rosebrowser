var ParticleEmitter = require('./particleemitter');
var Effect = require('./effect');

/**
 * @constructor
 */
var _EffectManager = function()
{
};

_EffectManager._createEmitter = function(data)
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

_EffectManager._loadParticleEffect = function(path, callback) {
  var effect = new Effect.Particle();
  effect.path = path;

  ParticleSystemData.load(path, function(particleSystem) {
    for (var i = 0; i < particleSystem.emitters.length; ++i) {
      var emitter = _EffectManager._createEmitter(particleSystem.emitters[i]);
      effect.emitters.push(emitter);

      if (effect.subRootObj) {
        effect.subRootObj.add(emitter.rootObj);
      } else {
        effect.rootObj.add(emitter.rootObj);
      }
    }

    if (callback) {
      callback();
    }
  });

  return effect;
};

_EffectManager._loadMeshAnimation = function(data, callback) {
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

  animation.material = material;

  Mesh.load(data.meshPath, function(geometry) {
    animation.mesh = new THREE.Mesh(geometry, animation.material);
    animation.rootObj.add(animation.mesh);

    // ROSE, you suck...
    if (data.animationPath) {
      AnimationData.load(data.animationPath, function (animData) {
        var meshAnim = new GeometryAnimator(geometry, animData);
        meshAnim.loop = data.loopCount;
        animation.meshAnimation = meshAnim;
        callback();
      });
    } else {
      callback();
    }
  });

  return animation;
};

_EffectManager._createParticleEffect = function(data, callback) {
  var waitAll = new MultiWait();

  var particle = _EffectManager._loadParticleEffect(data.particlePath, waitAll.one());

  // Set initial properties
  particle.startDelay = data.delay / 1000;
  particle.rootObj.position.copy(data.position);
  particle.rootObj.quaternion.copy(data.rotation);

  if (data.animation.enabled) {
    particle.subRootObj = particle.rootObj;
    particle.rootObj = new THREE.Object3D();
    particle.rootObj.add(particle.subRootObj);

    AnimationData.load(data.animation.path, function (particleAnimWait, animData) {
      particle.animation = new ObjectAnimator(particle.rootObj, animData);
      particle.animation.loop = data.animation.loopCount;
      particleAnimWait();
    }.bind(this, waitAll.one()));
  }

  waitAll.wait(callback);

  return particle;
};

_EffectManager._createMeshAnimation = function(data, callback) {
  var waitAll = new MultiWait();

  var meshAnimation = _EffectManager._loadMeshAnimation(data, waitAll.one());

  // Set initial properties
  meshAnimation.startDelay = data.delay / 1000;
  meshAnimation.rootObj.position.copy(data.position);
  meshAnimation.rootObj.quaternion.copy(data.rotation);

  if (data.animation.enabled) {
    meshAnimation.subRootObj = meshAnimation.rootObj;
    meshAnimation.rootObj = new THREE.Object3D();
    meshAnimation.rootObj.add(meshAnimation.subRootObj);

    AnimationData.load(data.animation.path, function (meshAnimWait, animData) {
      meshAnimation.animation = new ObjectAnimator(meshAnimation.rootObj, animData);
      meshAnimation.loop = data.animation.loopCount;
      meshAnimWait();
    }.bind(this, waitAll.one()));
  }

  waitAll.wait(callback);

  return meshAnimation;
};

_EffectManager.loadEffectByIdx = function(index, callback) {
  var effect = new Effect();

  GDM.get('file_effect', function (effectFileTable) {
    var effectRow = effectFileTable.row(index);
    _EffectManager.loadEffect(effectRow[1], callback, effect);
  });

  return effect;
};

_EffectManager.loadEffect = function(path, callback, effect) {
  if (config.noeffects) {
    // Don't load effects if they are disabled by configuration.
    callback(null);
    return;
  }

  effect = effect || new Effect();

  EffectData.load(path, function (effectData) {
    var waitAll = new MultiWait();

    effect.path = path;
    effect.rootObj.name = effectData.name + ".rootObj";
    effect.rootObj2.name = effectData.name +  ".rootObj2";
    // TODO: Effect sound - data.soundEnabled, data.soundPath

    for (var i = 0; i < effectData.particles.length; ++i) {
      var data = effectData.particles[i];
      var particle = _EffectManager._createParticleEffect(data, waitAll.one());

      if (data.linkRoot) {
        effect.rootObj.add(particle.rootObj);
      } else {
        effect.rootObj2.add(particle.rootObj);
      }

      effect.particleEffects.push(particle);
    }

    for (var i = 0; i < effectData.animations.length; ++i) {
      var data = effectData.animations[i];
      var meshAnimation = _EffectManager._createMeshAnimation(data, waitAll.one());

      if (data.linkRoot) {
        effect.rootObj.add(meshAnimation.rootObj);
      } else {
        effect.rootObj2.add(meshAnimation.rootObj);
      }

      effect.animations.push(meshAnimation);
    }

    waitAll.wait(function() {
      callback(effect);
    });
  });
};

// TODO: Make this newed so everything is consistent
var EffectManager = _EffectManager;
module.exports = EffectManager;
