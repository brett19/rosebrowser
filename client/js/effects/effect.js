/**
 * @constructor
 */
var Effect = function()
{
  EventEmitter.call(this);

  this.rootObj  = new THREE.Object3D();
  this.rootObj2 = new THREE.Object3D();

  this.isPlaying = false;
  this.particleEffects = [];
  this.animations = [];
};
Effect.prototype = Object.create( EventEmitter.prototype );

Effect.STATE = {
  READY_TO_PLAY: 0,
  PLAYING: 1,
  STOPPED: 2
};

Effect.prototype.resetBlendWeights = function() {
  // Needed for THREE.AnimationHandler
};

Effect.prototype.play = function() {
  this.isPlaying = true;
  THREE.AnimationHandler.play(this);

  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].play();
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].play();
  }
};

Effect.prototype.stop = function() {
  this.isPlaying = false;
  THREE.AnimationHandler.stop(this);

  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].stop();
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].stop();
  }
};

Effect.prototype.update = function(delta) {
  if (!this.isPlaying) {
    return;
  }

  var areAnyPlaying = false;
  for (var i = 0; i < this.particleEffects.length; ++i) {
    this.particleEffects[i].update(delta);

    if (this.particleEffects[i].state !== Effect.STATE.STOPPED) {
      areAnyPlaying = true;
    }
  }

  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].update(delta);

    if (this.animations[i].state !== Effect.STATE.STOPPED) {
      areAnyPlaying = true;
    }
  }

  if (!areAnyPlaying) {
    this.isPlaying = false;
    this.emit('finish');
  }
};

/**
 * @constructor
 */
Effect.Particle = function()
{
  this.rootObj = new THREE.Object3D();
  this.subRootObj = null;
  this.emitters = [];
  this.startDelay = 0;
  this.animation = null;
  this.state = Effect.STATE.READY_TO_PLAY;
};

Effect.Particle.prototype.play = function() {
  // Initialise stuff to play
};

Effect.Particle.prototype.pause = function() {
  // TODO: Make this actually work properly
  this.state = Effect.STATE.STOPPED;
};

Effect.Particle.prototype.stop = function() {
  // Make shit stop
  this.state = Effect.STATE.STOPPED;
};

Effect.Particle.prototype.deleteAllParticles = function() {
  for (var i = 0; i < this.emitters.length; ++i) {
    this.emitters[i].deleteAllParticles();
  }
};

var totalStarted = 0;

Effect.Particle.prototype.update = function(delta) {
  if (this.state === Effect.STATE.READY_TO_PLAY) {
    this.startDelay -= delta;

    if (this.startDelay <= 0) {
      this.state = Effect.STATE.PLAYING;

      if (this.animation) {
        this.animation.play();
      }

      delta = -this.startDelay;
    }
  }

  if (this.state === Effect.STATE.PLAYING) {
    var isRunning = false;
    for (var i = 0; i < this.emitters.length; ++i) {
      var emitter = this.emitters[i];
      if (emitter.update(delta)) {
        isRunning = true;
      }
    }
    if (this.animation && !this.animation.isPlaying) {
      isRunning = false;
    }
    if (!isRunning) {
      this.pause();
      this.deleteAllParticles();
    }
  }
};

/**
 * @constructor
 */
Effect.Animation = function() {
  this.rootObj = new THREE.Object3D();
  this.subRootObj = null;
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

Effect.Animation.prototype.pause = function() {
  // Make this work properly
  this.state = Effect.STATE.STOPPED;
};

Effect.Animation.prototype.stop = function() {
  // Make shit stop
};

Effect.Animation.prototype.update = function(delta) {
  if (this.state === Effect.STATE.READY_TO_PLAY) {
    this.startDelay -= delta;

    if (this.startDelay <= 0) {
      this.state = Effect.STATE.PLAYING;

      if (this.animation) {
        this.animation.once('finish', function() {
          this.animation.stop();
        }.bind(this));
        this.animation.play();
      }

      if (this.meshAnimation) {
        this.meshAnimation.once('finish', function() {
          this.meshAnimation.stop();
          this.pause();
        }.bind(this));
        this.meshAnimation.play();
      }

      delta = -this.startDelay;
    }
  }
};

module.exports = Effect;
