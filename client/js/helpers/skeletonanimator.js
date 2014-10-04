'use strict';

// TODO: Refactor for common Animator class
//  This class is mostly portable to other animators with customized
//  constructors for the objects list and custom _applyChannel method.

/**
 * An Animator class for animating Skeleton's based on an AnimationData.
 *
 * @constructor
 * @param {THREE.Skeleton} object
 * The skeleton to animate.
 * @param {AnimationData} animationData
 * The AnimationData to animate the geometry with.
 */
function SkeletonAnimator(skeleton, animationData) {
  EventEmitter.call(this);

  this.objects = skeleton.bones;
  this.data = animationData;
  this.currentTime = 0;
  this.isPlaying = false;
  this.loop = true;
  this.timeScale = 1;
  this.length = this.data.frameCount / this.data.fps;
}

SkeletonAnimator.prototype = Object.create(EventEmitter.prototype);

SkeletonAnimator.prototype.play = function (startTime, weight) {
  this.currentTime = startTime !== undefined ? startTime : 0;
  this.weight = weight !== undefined ? weight : 1;

  this.isPlaying = true;

  this.reset();

  THREE.AnimationHandler.play(this);
};


SkeletonAnimator.prototype.stop = function () {
  this.isPlaying = false;

  THREE.AnimationHandler.stop(this);
};

SkeletonAnimator.prototype.reset = function () {
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

SkeletonAnimator.prototype.resetBlendWeights = function () {
  for (var h = 0, hl = this.objects.length; h < hl; h++) {
    var object = this.objects[h];

    if (object.animatorCache !== undefined) {
      object.animatorCache.blending.positionWeight = 0.0;
      object.animatorCache.blending.quaternionWeight = 0.0;
      object.animatorCache.blending.scaleWeight = 0.0;
    }
  }
};

SkeletonAnimator.prototype._applyChannel = function(index, type, value) {
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
  }
};

SkeletonAnimator.prototype.update = (function() {
  var _SLERPER = new THREE.Quaternion();
  var _V3LERPER = new THREE.Vector3();
  var _V2LERPER = new THREE.Vector2();

  return function (delta) {
    if (this.isPlaying === false) return delta;

    this.currentTime += delta * this.timeScale;

    if (this.currentTime >= this.length || this.currentTime < 0) {
      if (this.loop) {
        this.currentTime %= this.length;

        if (this.currentTime < 0) {
          this.currentTime += this.length;
        }

        this.reset();
        this.emit('restart');
      } else {
        this.stop();
        this.emit('finish');
        return this.currentTime - this.length;
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
        } else {
          f = f0;
        }
      }

      this._applyChannel(c.index, c.type, f);
    }

    return 0;
  };
})();
