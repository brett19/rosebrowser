'use strict';

var ParticleEmitter = function(data)
{
  this.rootObj = new THREE.Object3D();
  this.particles = [];
  this.data = data;
  this.newParticleCounter = 0;
  this.totalParticleLives = 0;

  this.texture = RoseTextureManager.load(data.texturePath);
  this.texture.repeat.set(1 / data.spriteCols, 1 / data.spriteRows);

  // TODO: i'd really like to COPY data.events and keep it local to this instance.

  // Setup our actual event times
  for (var j = 0; j < data.events.length; ++j) {
    var event = data.events[j];
    event.actualTime = event.time.getValueInRange();
  }

  // Link events
  for (var j = 0; j < data.events.length; ++j) {
    for (var k = j + 1; k < data.events.length; ++k) {
      if (data.events[j].type === data.events[k].type) {
        if (data.events[k].blended) {
          data.events[j].nextEvent = data.events[k];
        }
        break;
      }
    }
  }

  // Sort the events
  data.events.sort(function(left, right) {
    return left.actualTime - right.actualTime;
  });
};

ParticleEmitter.prototype.createParticle = function()
{
  var particle = new ParticleEmitter.Particle();

  // Create material
  particle.material = new THREE.SpriteMaterial({
    map: this.texture,
    useScreenCoordinates: false,
    transparent: true,
    blending: THREE.CustomBlending,
    blendEquation: convertZnzinBlendOp(this.data.blendOp),
    blendSrc: convertZnzinBlendOp(this.data.blendSrc),
    blendDst: convertZnzinBlendOp(this.data.blendDst)
  });

  // Create sprite
  particle.sprite = new THREE.Sprite(particle.material);
  this.rootObj.add(particle.sprite);
  this.totalParticleLives++;
  this.particles.push(particle);

  // Set the initial properties
  particle.lifetime = this.data.lifeTime.getValueInRange();
  particle.position = this.data.emitRadius.getValueInRange();
  particle.gravity  = this.data.gravity.getValueInRange();
  particle.textureCols = this.data.spriteCols;
  particle.textureRows = this.data.spriteRows;
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
      --i;
    }
  }


  var frameEmitRate = this.data.emitRate.getValueInRange();
  var numNewParts = Math.floor(frameEmitRate * dt);

  this.newParticleCounter += (frameEmitRate * dt) - numNewParts;

  if ( this.newParticleCounter > 1) {
    numNewParts += Math.floor(this.newParticleCounter);
    this.newParticleCounter -= Math.floor(this.newParticleCounter);
  }

  /*
   var newParticles = Math.floor(this.newParticleCounter);
   this.newParticleCounter -= newParticles;

   var isRunning = true;

   if (this.data.loopCount > 0 && this.totalParticleLives + newParticles > this.data.loopCount * this.data.particleCount) {
   newParticles = (this.data.loopCount * this.data.particleCount) - this.totalParticleLives;
   newParticles = Math.max(0, newParticles);

   if (newParticles === 0 && this.particles.length === 0) {
   isRunning = false;
   }
   } else if (this.data.loopCount > 0 && this.totalParticleLives >= this.data.loopCount * this.data.particleCount) {
   if (this.particles.length === 0) {
   isRunning = false;
   }
   }


   newParticles = Math.min(newParticles, this.data.particleCount - this.particles.length);

   if (newParticles > 1) {
   console.log("this.newParticleCounter > 1, pCount: " + this.data.particleCount + " length: " + this.particles.length + " newParticles: " + newParticles);
   }*/

  numNewParts = Math.min(numNewParts, this.data.particleCount - this.particles.length);

  for (var i = 0; i < numNewParts; ++i) {
    this.createParticle();
  }

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
  var dt = _dt * (ZZ_TICK_PER_SEC / 1000)

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

  this.sprite.position.copy(this.position);
  this.sprite.scale.set(this.size.x, -this.size.y, 1.0);
  this.sprite.material.rotation = this.rotation * (Math.PI / 180);
  this.sprite.material.color.setRGB(this.color.r, this.color.g, this.color.b);
  this.sprite.alpha = this.color.a;

  if (this.textureRows > 1 || this.textureColumns > 1) {
    var index = Math.floor(this.textureIndex);
    var offsetX = index % this.textureColumns;
    var offsetY = Math.floor(index / this.textureRows);
    offsetX /= this.textureColumns;
    offsetY /= this.textureRows;
    this.sprite.material.map.offset.set(offsetX, offsetY);
  }

  return true;
};

/**
 * @param {ParticleEmitter.Particle} particle
 */
ParticleEmitter.prototype.applyEvents = function(particle)
{
  var dt, event;

  for (; particle.eventIndex < this.data.events.length; ++particle.eventIndex) {
    event = this.data.events[particle.eventIndex];

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
        }

        if (event.nextEvent) {
          var next = event.nextEvent.size.getValueInRange();
          particle.sizeStep.x = (next.x - particle.size.x) / dt;
          particle.sizeStep.y = (next.y - particle.size.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.RED:
        if (!event.blended) {
          particle.color.r = event.red.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.red.getValueInRange();
          particle.colorStep.r = (next - particle.color.r) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.GREEN:
        if (!event.blended) {
          particle.color.g = event.green.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.green.getValueInRange();
          particle.colorStep.g = (next - particle.color.g) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.BLUE:
        if (!event.blended) {
          particle.color.b = event.blue.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.blue.getValueInRange();
          particle.colorStep.b = (next - particle.color.b) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ALPHA:
        if (!event.blended) {
          particle.color.a = event.alpha.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.alpha.getValueInRange();
          particle.colorStep.a = (next - particle.color.a) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.COLOR:
        if (!event.blended) {
          particle.color = event.color.getValueInRange();
        }

        if (event.nextEvent) {
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
        }

        if (event.nextEvent) {
          var next = event.nextEvent.velocityX.getValueInRange();
          particle.velocityStep.x = (next - particle.velocity.x) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Y:
        if (!event.blended) {
          particle.velocity.y = event.velocityY.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.velocityY.getValueInRange();
          particle.velocityStep.y = (next - particle.velocity.y) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY_Z:
        if (!event.blended) {
          particle.velocity.z = event.velocityZ.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.velocityZ.getValueInRange();
          particle.velocityStep.z = (next - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.VELOCITY:
        if (!event.blended) {
          particle.velocity = event.velocity.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.velocity.getValueInRange();
          particle.velocityStep.x = (next.x - particle.velocity.x) / dt;
          particle.velocityStep.y = (next.y - particle.velocity.y) / dt;
          particle.velocityStep.z = (next.z - particle.velocity.z) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.TEXTURE:
        if (!event.blended) {
          particle.textureIndex = event.textureIndex.getValueInRange();
        }

        if (event.nextEvent) {
          var next = event.nextEvent.textureIndex.getValueInRange();
          particle.textureIndexStep = (next - particle.textureIndex) / dt;
        }
        break;
      case ParticleSystem.EVENT_TYPE.ROTATION:
        if (!event.blended) {
          particle.rotation = event.rotation.getValueInRange();
        }

        if (event.nextEvent) {
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
};
