'use strict';

/**
 * An Animator class for animating objects based on an AnimationData.
 *
 * @constructor
 * @param {THREE.Object[]} objects
 * The objects to animate.
 * @param {AnimationData} animationData
 * The AnimationData to animate with.
 */
function Animator(object, animationData) {
  EventEmitter.call(this);

  this.objects = object;
  this.data = animationData;
  this.currentTime = 0;
  this.isPlaying = false;
  this.isPaused = false;
  this.loop = true;
  this.timeScale = 1;
  this.length = this.data.frameCount / this.data.fps;
}

Animator.prototype = Object.create(EventEmitter.prototype);

Animator.prototype.play = function (startTime, weight) {
  this.currentTime = startTime !== undefined ? startTime : 0;
  this.weight = weight !== undefined ? weight : 1;

  this.isPlaying = true;
  this.isPaused = false;

  this.reset();

  THREE.AnimationHandler.play(this);
};

Animator.prototype.pause = function() {
  this.isPaused = true;
};

Animator.prototype.stop = function () {
  this.isPlaying = false;
  this.isPaused = false;

  THREE.AnimationHandler.stop(this);
};

Animator.prototype.reset = function () {
  for (var h = 0, hl = this.objects.length; h < hl; h++) {
    var object = this.objects[h];

    object.matrixAutoUpdate = true;

    if (object.animatorCache === undefined) {
      object.animatorCache = {
        blending: {
          positionWeight: 0.0,
          quaternionWeight: 0.0,
          scaleWeight: 0.0
        }
      }
    }
  }
};

Animator.prototype.resetBlendWeights = function () {
  for (var h = 0, hl = this.objects.length; h < hl; h++) {
    var object = this.objects[h];

    if (object.animatorCache !== undefined) {
      object.animatorCache.blending.positionWeight = 0.0;
      object.animatorCache.blending.quaternionWeight = 0.0;
      object.animatorCache.blending.scaleWeight = 0.0;
    }
  }
};

Animator.prototype._applyChannel = function(index, type, value) {
  var object = this.objects[index];
  var blending = object.animatorCache.blending;

  object.matrixAutoUpdate = true;
  object.matrixWorldNeedsUpdate = true;

  if (type === AnimationData.CHANNEL_TYPE.Position) {
    if (blending.positionWeight === 0) {
      object.position.copy(value);
      blending.positionWeight = this.weight;
    } else {
      var proportionalWeight = this.weight / (this.weight + blending.positionWeight);
      object.position.lerp(value, proportionalWeight);
      blending.positionWeight += this.weight;
    }
  } else if (AnimationData.CHANNEL_TYPE.Rotation) {
    if (blending.quaternionWeight === 0) {
      object.quaternion.copy(value);
      blending.quaternionWeight = this.weight;
    } else {
      var proportionalWeight = this.weight / (this.weight + blending.quaternionWeight);
      object.quaternion.slerp(value, proportionalWeight);
      blending.quaternionWeight += this.weight;
    }
  } else if (AnimationData.CHANNEL_TYPE.Scale) {
    if (blending.scaleWeight === 0) {
      object.scale.copy(value);
      blending.scaleWeight = this.weight;
    } else {
      var proportionalWeight = this.weight / (this.weight + blending.scaleWeight);
      object.scale.lerp(value, proportionalWeight);
      blending.scaleWeight += this.weight;
    }
  }
};

Animator.prototype.update = (function() {
  var _SLERPER = new THREE.Quaternion();
  var _V3LERPER = new THREE.Vector3();
  var _V2LERPER = new THREE.Vector2();

  return function (delta) {
    if (this.isPlaying === false) return delta;

    if (!this.isPaused) {
      this.currentTime += delta * this.timeScale;

      // If this is the last frame, we have to stop at the last frame, rather
      //   then blending back towards frame 0, remove that time.
      var endTime = this.length;
      if (this.loop === 1) {
        endTime = (this.data.frameCount - 1) / this.data.fps;
      }

      if (this.currentTime >= endTime || this.currentTime < 0) {
        if (this.loop !== true && this.loop > 0) {
          this.loop--;
        }
        if (this.loop) {
          this.currentTime %= this.length;

          if (this.currentTime < 0) {
            this.currentTime += this.length;
          }

          this.reset();
          this.emit('restart');
        } else {
          this.currentTime = endTime;
          this.pause();
          this.emit('finish');
          return this.currentTime - this.length;
        }
      }
    }

    if (this.weight === 0) {
      return 0;
    }

    var thisFrame = Math.floor(this.currentTime * this.data.fps);
    var nextFrame = thisFrame + 1;
    if (nextFrame >= this.data.frameCount) {
      if (this.loop) {
        nextFrame -= this.data.frameCount;
      } else {
        nextFrame = thisFrame;
      }
    }
    var frameWeight = ( this.currentTime - (thisFrame / this.data.fps) ) / (1 / this.data.fps);

    for (var i = 0; i < this.data.channels.length; ++i) {
      var c = this.data.channels[i];

      var f0 = c.frames[thisFrame];
      var f1 = c.frames[nextFrame];
      var f = null;
      if (frameWeight === 0) {
        f = f0;
      } else {
        if (f0 instanceof THREE.Quaternion) {
          f = THREE.Quaternion.slerp(f0, f1, _SLERPER, frameWeight);
        } else if (f0 instanceof THREE.Vector3) {
          f = _V3LERPER.copy(f0).lerp(f1, frameWeight);
        } else if (f0 instanceof THREE.Vector2) {
          f = _V2LERPER.copy(f0).lerp(f1, frameWeight);
        } else if (f0 instanceof Number) {
          f = f0 * (1 - frameWeight) + f1 * frameWeight;
        } else {
          f = f0;
        }
      }

      this._applyChannel(c.index, c.type, f);
    }

    return 0;
  };
})();
