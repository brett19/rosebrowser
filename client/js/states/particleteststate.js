'use strict';

var particleSystems = [];


var Particle = function() {
  this.age = 0;
  this.lifetime = 1;
  this.eventIndex = 0;
  this.eventTimer = 0;

  this.position = new THREE.Vector3();
  this.gravity = new THREE.Vector3();

  this.size = new THREE.Vector2(10, 10);
  this.sizeStep = new THREE.Vector2();
  this.textureIndex = 0;
  this.textureIndexStep = 0;
  this.color = new Color4(1, 1, 1, 1);
  this.colorStep = new Color4();
  this.velocity = new THREE.Vector3();
  this.velocityStep = new THREE.Vector3();
  this.rotation = 0;
  this.rotationStep = 0;
};

function updateParticle(particle, dt) {
  particle.age += dt;
  particle.eventTimer += dt;

  if (particle.age > particle.lifetime) {
    return false;
  }

  particle.position.add(particle.velocity.clone().multiplyScalar(dt));
  particle.velocity.add(particle.gravity.clone().multiplyScalar(dt));
  particle.color.add(particle.colorStep.clone().multiplyScalar(dt));
  particle.velocity.add(particle.velocityStep.clone().multiplyScalar(dt));
  particle.size.add(particle.sizeStep.clone().multiplyScalar(dt));
  particle.textureIndex += particle.textureIndexStep * dt;
  particle.rotation += particle.rotationStep * dt;

  if (particle.rotation >= 360) {
    particle.rotation -= 360;
  }

  return true;
}

function updateSystem(system, ms) {
  var dt = ms;
  for (var i = 0; i < system.particles.length; ++i) {
    var particle = system.particles[i];
    if (updateParticle(particle, dt)) {
      applyParticleEvents(particle, system.events);
    }

    system.geom.vertices[i].copy(particle.position);
    system.geom.colors[i].setRGB(particle.color.r, particle.color.g, particle.color.b);
    system.material.attributes.alpha.value[i] = particle.color.a;
    system.material.attributes.psize.value[i] = 10;
    system.geom.verticesNeedUpdate = true;
  }

  // Create new particles if we are not at particleCount yet!!
}

function applyParticleEvents(particle, events) {
  for (; particle.eventIndex < events.length; ++particle.eventIndex) {
    var event = events[particle.eventIndex];
    var dt;

    if (event.actualTime > particle.eventTimer) {
      break;
    }

    if (event.nextEvent) {
      dt = event.nextEvent.actualTime - event.actualTime;
    }

    // Apply events
    switch (event.type) {
      case ParticleSystem.EVENT_TYPE.SIZE:
        if (!event.blended) {
          particle.size = event.size.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.size.getValueInRange();
          particle.sizeStep.x = (next - particle.size.x) / dt;
          particle.sizeStep.y = (next - particle.size.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.RED:
        if (!event.blended) {
          particle.color.r = event.red.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.red.getValueInRange();
          particle.colorStep.r = (next - particle.color.r) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.GREEN:
        if (!event.blended) {
          particle.color.g = event.green.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.green.getValueInRange();
          particle.colorStep.g = (next - particle.color.g) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.BLUE:
        if (!event.blended) {
          particle.color.b = event.blue.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.blue.getValueInRange();
          particle.colorStep.b = (next - particle.color.b) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ALPHA:
        if (!event.blended) {
          particle.color.a = event.alpha.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.alpha.getValueInRange();
          particle.colorStep.a = (next - particle.color.a) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.COLOUR:
        if (!event.blended) {
          particle.color = event.color.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.color.getValueInRange();
          particle.colorStep.r = (next.r - particle.color.r) / dt;
          particle.colorStep.g = (next.g - particle.color.g) / dt;
          particle.colorStep.b = (next.b - particle.color.b) / dt;
          particle.colorStep.a = (next.a - particle.color.a) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_X:
        if (!event.blended) {
          particle.velocity.x = event.velocityX.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.velocityX.getValueInRange();
          particle.velocityStep.x = (next - particle.velocity.x) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Y:
        if (!event.blended) {
          particle.velocity.y = event.velocityY.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.velocityY.getValueInRange();
          particle.velocityStep.y = (next - particle.velocity.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Z:
        if (!event.blended) {
          particle.velocity.z = event.velocityZ.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.velocityZ.getValueInRange();
          particle.velocityStep.z = (next - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY:
        if (!event.blended) {
          particle.velocity = event.velocity.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.velocity.getValueInRange();
          particle.velocityStep.x = (next.x - particle.velocity.x) / dt;
          particle.velocityStep.y = (next.y - particle.velocity.y) / dt;
          particle.velocityStep.z = (next.z - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.TEXTURE:
        if (!event.blended) {
          particle.textureIndex = event.textureIndex.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.textureIndex.getValueInRange();
          particle.textureIndexStep = (next - particle.textureIndex) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ROTATION:
        if (!event.blended) {
          particle.rotation = event.rotation.getValueInRange();
        } else if (event.nextEvent) {
          var next = event.nextEvent.rotation.getValueInRange();
          particle.rotationStep = (next - particle.rotation) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.TIMER:
        particle.eventTimer = event.timer.getValueInRange();

        // Find new eventIndex
        particle.eventIndex = 0;

        for (; particle.eventIndex < events.length; particle.eventIndex++) {
          if (events[particle.eventIndex].actualTime >= particle.eventTimer) {
            break;
          }
        }

        particle.eventIndex--; // because outer loop ++
        break;
    }
  }
}

function ParticleTestState() {
  this.DM = new DataManager();
  this.world = null;
}

ParticleTestState.prototype.prepare = function(callback) {
  this.DM.register('canim_intro', Animation, '3DDATA/TITLEIROSE/CAMERA01_INTRO01.ZMO');
  this.DM.register('canim_inselect', Animation, '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO');
  this.DM.register('canim_ingame', Animation, '3DDATA/TITLEIROSE/CAMERA01_INGAME01.ZMO');
  this.DM.register('canim_create', Animation, '3DDATA/TITLEIROSE/CAMERA01_CREATE01.ZMO');
  this.DM.register('canim_outcreate', Animation, '3DDATA/TITLEIROSE/CAMERA01_OUTCREATE01.ZMO');

  var self = this;
  this.DM.get('canim_intro', function() {
    callback();

    // Continue by preloading the rest for now.
    self.DM.get('canim_inselect');
    self.DM.get('canim_ingame');
    self.DM.get('canim_create');
    self.DM.get('canim_outcreate');

  });

  this.activeCamAnim = null;
};

ParticleTestState.prototype.playCamAnim = function(name, loopCount) {
  var self = this;
  this.DM.get(name, function(zmoData) {
    if (self.activeCamAnim) {
      self.activeCamAnim.stop();
      self.activeCamAnim = null;
    }

    self.activeCamAnim =
      new CameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    self.activeCamAnim.play(loopCount);
  });
};

ParticleTestState.prototype.spawnParticles = function() {
  Effect.load('3Ddata\\EFFECT\\_FIREWORK_01.EFT', function(effect){
    console.log(effect);

    ParticleSystem.load(effect.particles[0].particlePath, function(particleSystem) {
      console.log(particleSystem)

      for (var i = 0; i < particleSystem.emitters.length; ++i) {
        var emitter = particleSystem.emitters[i];
        var texture = RoseTextureManager.load(emitter.texturePath);
        var myNewSystem = {};

        emitter.particles = [];

        // Setup our actual even times
        for (var j = 0; j < emitter.events.length; ++j) {
          var event = emitter.events[j];
          event.actualTime = event.time.getValueInRange() / 1000;
        }

        // Link events
        for (var j = 0; j < emitter.events.length; ++j) {
          for (var k = j + 1; k < emitter.events.length; ++k) {
            if (emitter.events[j].type === emitter.events[k].type) {
              emitter.events[j].nextEvent = emitter.events[k];
              break;
            }
          }
        }

        // Sort the events
        emitter.events.sort(function(left, right) {
          return left.actualTime - right.actualTime;
        });

        // Create our initial particles
        myNewSystem.particles = [];
        myNewSystem.events = emitter.events;

        var geom = new THREE.Geometry();

        var shaderMan = ShaderManager.get('particle').clone();

        var material = new THREE.ShaderMaterial({
          uniforms: {
            texture1:   { type: "t", value: texture }
          },
          attributes: {
            psize:  { type: 'f', value: [] },
            alpha:  { type: 'f', value: [] }
          },

          vertexShader: shaderMan.vertexShader,
          fragmentShader: shaderMan.fragmentShader
        });

        material.transparent = true;
        material.blending = THREE.CustomBlending;
        material.blendEquation = convertZnzinBlendOp(emitter.blendOp);
        material.blendSrc = convertZnzinBlendType(emitter.blendSrc);
        material.blendDst = convertZnzinBlendType(emitter.blendDst);
        myNewSystem.material = material;

        geom.colors = [];
        material.attributes.psize.value = [];
        material.attributes.alpha.value = [];
        material.attributes.alpha.needsUpdate = true;
        material.attributes.psize.needsUpdate = true;
        material.needsUpdate = true;

        for (var j = 0; j < emitter.particleCount; ++j) {
          var particle = new Particle();
          particle.lifetime = emitter.lifeTime.getValueInRange();
          particle.position = emitter.emitRadius.getValueInRange();
          particle.gravity = emitter.gravity.getValueInRange();

          applyParticleEvents(particle, emitter.events);
          myNewSystem.particles.push(particle);

          emitter.particles.push(particle);
          geom.vertices[j] = particle.position;
          geom.colors[j] = new THREE.Color(particle.color.r, particle.color.g, particle.color.b);
          material.attributes.psize.value[j] = 10;
          material.attributes.alpha.value[j] = 1;
        }

        var pointCloud = new THREE.PointCloud(geom, material);
        pointCloud.position.set(5195, 5375, 10);
        scene.add(pointCloud);

        geom.dynamic = true;
        pointCloud.dynamic = true;
        myNewSystem.geom = geom;
        myNewSystem.material = material;
        myNewSystem.pointCloud = pointCloud;
        particleSystems.push(myNewSystem);
      }
    });
  });
};

ParticleTestState.prototype.enter = function() {
  var self = this;

  debugGui.add(this, 'spawnParticles');

  var wm = new WorldManager();
  wm.rootObj.position.set(5200, 5200, 0);
  wm.setMap(4, function() {
    console.log('Map Ready');
  });
  this.world = wm;
  scene.add(wm.rootObj);

  //this.playCamAnim('canim_intro');

  var container = document.createElement( 'div' );
  document.body.appendChild( container );

  var controls = new THREE.FlyControls(camera);
  controls.movementSpeed = 100;
  controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5154;
  camera.position.y = 5417;
  camera.position.z = 49;

  /*
   var charObj = new NpcCharacter();
   charObj.setModel(1);
   */
  var charObj = new CharPawn();
  charObj.setGender(0, function() {
    charObj.setModelPart(3, 1);
    charObj.setModelPart(4, 1);
    charObj.setModelPart(5, 1);
    charObj.setModelPart(7, 202);
    charObj.setModelPart(8, 2);

    var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
    Animation.load(animPath, function(zmoData) {
      var anim = zmoData.createForSkeleton('test', charObj.rootObj, charObj.skel);
      anim.play();
    });
  });
  charObj.rootObj.position.set(5195, 5375, 5);
  charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI);
  charObj.rootObj.scale.set(1.2, 1.2, 1.2);
  scene.add(charObj.rootObj);
};

ParticleTestState.prototype.leave = function() {

};

ParticleTestState.prototype.update = function(delta) {
  this.controls.update( delta );

  for (var i = 0; i < particleSystems.length; ++i) {
    updateSystem(particleSystems[i], delta);
  }

  if (this.world.isLoaded) {
    this.world.setViewerInfo(camera.position);
    this.world.update(delta);
  }
};

var gsParticleTest = new ParticleTestState();
