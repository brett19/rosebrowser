'use strict';

var ParticleEmitter = function(name)
{
  this.rootObj = new THREE.Object3D();

  this.name = name;

  this.events = [];
  this.particles = [];

  this.newParticleCounter = 0;
  this.totalParticleLives = 0;
};

ParticleEmitter.Particle = function()
{
  this.sprite = 0;

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
  this.textureColumns = 1;
  this.textureRows = 1;
  this.color = new Color4(1, 1, 1, 1);
  this.colorStep = new Color4();
  this.velocity = new THREE.Vector3();
  this.velocityStep = new THREE.Vector3();
  this.rotation = 0;
  this.rotationStep = 0;
};

ParticleEmitter.Particle.prototype.update = function(_dt)
{
  var dt = _dt * (ZZ_TICK_PER_SEC / 1000);

  this.age += dt;
  this.eventTimer += dt;

  if (this.age >= this.lifetime) {
    return false;
  }

  this.position.add(this.velocity.clone().multiplyScalar(dt));
  this.velocity.add(this.gravity.clone().multiplyScalar(dt));
  this.color.add(this.colorStep.clone().multiplyScalar(dt));
  this.velocity.add(this.velocityStep.clone().multiplyScalar(dt));
  this.size.add(this.sizeStep.clone().multiplyScalar(dt));
  this.textureIndex += this.textureIndexStep * dt;
  this.rotation += this.rotationStep * dt;

  while (this.rotation >= 360) {
    this.rotation -= 360;
  }

  while (this.rotation < 0) {
    this.rotation += 360;
  }

  this.billboard.position.copy(this.position);

  this.billboardMesh.scale.x = this.size.x;
  this.billboardMesh.scale.y = this.size.y;
  this.billboardMesh.rotation.z = this.rotation * (Math.PI / 180);
  this.billboardMesh.material.uniforms.vColor.value.setRGB(this.color.r, this.color.g, this.color.b);
  this.billboardMesh.material.uniforms.vAlpha.value = this.color.a;


  if (this.alignType === ParticleSystem.ALIGN_TYPE.AXIS_ALIGNED) {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(camera.quaternion, 'ZXY');
    euler.x = 0;
    euler.y = 0;

    // Rotate to face camera
    this.billboard.quaternion.setFromEuler(euler);
  } else if (this.alignType === ParticleSystem.ALIGN_TYPE.BILLBOARD) {
    this.billboard.quaternion.copy(camera.quaternion);
  }

  if (this.textureRows > 1 || this.textureColumns > 1) {
    var index = Math.floor(this.textureIndex);
    var offsetX = index % this.textureColumns;
    var offsetY = Math.floor(index / this.textureRows);
    offsetX /= this.textureColumns;
    offsetY /= this.textureRows;
    this.billboardMesh.material.uniforms.uvScale.value.set(1 / this.textureColumns, 1 / this.textureRows);
    this.billboardMesh.material.uniforms.uvOffset.value.set(offsetX, offsetY);
  }

  return true;
};

ParticleEmitter.prototype.createParticle = function()
{
  var particle = new ParticleEmitter.Particle();

  // Create plane
  var planeGeom = new THREE.PlaneGeometry(1, 1, 1, 1);
  var planeMat = this.material.clone();
  planeMat.uniforms.texture1.value = this.texture;

  for (var i = 0; i < 2; ++i) {
    for (var j = 0; j < 3; ++j) {
      planeGeom.faceVertexUvs[0][i][j] = new THREE.Vector2(planeGeom.faceVertexUvs[0][i][j].x, 1 - planeGeom.faceVertexUvs[0][i][j].y);
    }
  }

  particle.billboardMesh = new THREE.Mesh(planeGeom, planeMat);

  if (this.alignType === ParticleSystem.ALIGN_TYPE.AXIS_ALIGNED) {
    particle.billboardMesh.rotation.x = Math.PI / 2;
  }

  particle.billboard = new THREE.Object3D();
  particle.billboard.add(particle.billboardMesh);

  this.rootObj.add(particle.billboard);
  this.totalParticleLives++;
  this.particles.push(particle);

  // Set the initial properties
  particle.lifetime = this.lifeTime.getValueInRange();
  particle.position = this.emitRadius.getValueInRange();
  particle.gravity  = this.gravity.getValueInRange();
  particle.textureColumns = this.spriteCols;
  particle.textureRows = this.spriteRows;
  particle.alignType = this.alignType;
  this.applyEvents(particle);
  particle.update(0);

  return particle;
};

ParticleEmitter.prototype.update = function(dt)
{
  for (var i = 0; i < this.particles.length; ++i) {
    var particle = this.particles[i];

    if (particle.update(dt)) {
      this.applyEvents(particle);
    } else {
      this.particles.splice(i, 1);
      this.rootObj.remove(particle.sprite);
      this.rootObj.remove(particle.billboard);
      --i;
    }
  }

  var frameEmitRate = this.emitRate.getValueInRange();
  var numNewParts = Math.floor(frameEmitRate * dt);
  var isRunning = true;

  this.newParticleCounter += (frameEmitRate * dt) - numNewParts;

  if ( this.newParticleCounter > 1) {
    numNewParts += Math.floor(this.newParticleCounter);
    this.newParticleCounter -= Math.floor(this.newParticleCounter);
  }

  numNewParts = Math.min(numNewParts, this.particleCount - this.particles.length);

  if (this.loopCount > 0 && this.totalParticleLives + numNewParts > this.loopCount * this.particleCount) {
    numNewParts = (this.loopCount * this.particleCount) - this.totalParticleLives;
    numNewParts = Math.max(0, numNewParts);

    if (numNewParts === 0 && this.particles.length === 0) {
      isRunning = false;
    }
  } else if (this.loopCount > 0 && this.totalParticleLives >= this.loopCount * this.particleCount) {
    if (this.particles.length === 0) {
      isRunning = false;
    }
  }

  for (var i = 0; i < numNewParts; ++i) {
    this.createParticle();
  }

  if (!isRunning) {
    // TODO: Destroy this particle emitter!
  }

  var parentObject = this.rootObj.parent;

  switch (this.coordType) {
    case ParticleSystem.COORD_TYPE.LOCAL:
      // Do nothing
      break;
    case ParticleSystem.COORD_TYPE.WORLD:
    // Reverse all parent transform
    // TODO: Reverse parent location?!?!
    case ParticleSystem.COORD_TYPE.LOCAL_WORLD:
      // Reverse parent rotation
      var rotate = new THREE.Quaternion();
      rotate.setFromRotationMatrix(parentObject.matrixWorld);
      rotate.inverse();
      this.rootObj.quaternion.copy(rotate);
      break;
  }
};

/**
 * @param {ParticleEmitter.Particle} particle
 */
ParticleEmitter.prototype.applyEvents = function(particle)
{
  var dt, event;

  for (; particle.eventIndex < this.events.length; ++particle.eventIndex) {
    event = this.events[particle.eventIndex];

    if (event.time > particle.eventTimer) {
      break;
    }

    if (event.fadeEvent) {
      dt = event.fadeEvent.time - event.time;
    }

    // Apply events
    switch (event.type) {
      case ParticleSystem.EVENT_TYPE.SIZE:
        if (!event.fade) {
          particle.size = event.size.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.size.getValueInRange();
          particle.sizeStep.x = (next.x - particle.size.x) / dt;
          particle.sizeStep.y = (next.y - particle.size.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.RED:
        if (!event.fade) {
          particle.color.r = event.red.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.red.getValueInRange();
          particle.colorStep.r = (next - particle.color.r) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.GREEN:
        if (!event.fade) {
          particle.color.g = event.green.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.green.getValueInRange();
          particle.colorStep.g = (next - particle.color.g) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.BLUE:
        if (!event.fade) {
          particle.color.b = event.blue.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.blue.getValueInRange();
          particle.colorStep.b = (next - particle.color.b) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ALPHA:
        if (!event.fade) {
          particle.color.a = event.alpha.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.alpha.getValueInRange();
          particle.colorStep.a = (next - particle.color.a) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.COLOR:
        if (!event.fade) {
          particle.color = event.color.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.color.getValueInRange();
          particle.colorStep.r = (next.r - particle.color.r) / dt;
          particle.colorStep.g = (next.g - particle.color.g) / dt;
          particle.colorStep.b = (next.b - particle.color.b) / dt;
          particle.colorStep.a = (next.a - particle.color.a) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_X:
        if (!event.fade) {
          particle.velocity.x = event.velocityX.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.velocityX.getValueInRange();
          particle.velocityStep.x = (next - particle.velocity.x) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Y:
        if (!event.fade) {
          particle.velocity.y = event.velocityY.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.velocityY.getValueInRange();
          particle.velocityStep.y = (next - particle.velocity.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Z:
        if (!event.fade) {
          particle.velocity.z = event.velocityZ.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.velocityZ.getValueInRange();
          particle.velocityStep.z = (next - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY:
        if (!event.fade) {
          particle.velocity = event.velocity.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.velocity.getValueInRange();
          particle.velocityStep.x = (next.x - particle.velocity.x) / dt;
          particle.velocityStep.y = (next.y - particle.velocity.y) / dt;
          particle.velocityStep.z = (next.z - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.TEXTURE:
        if (!event.fade) {
          particle.textureIndex = event.textureIndex.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.textureIndex.getValueInRange();
          particle.textureIndexStep = (next - particle.textureIndex) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ROTATION:
        if (!event.fade) {
          particle.rotation = event.rotation.getValueInRange();
        }

        if (event.fadeEvent) {
          var next = event.fadeEvent.rotation.getValueInRange();
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
};
