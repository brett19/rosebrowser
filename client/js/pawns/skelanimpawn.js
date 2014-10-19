var Pawn = require('./pawn');

function SkelAnimPawn() {
  Pawn.call(this);

  this.skel = null;
  this.skelWaiters = [];
  this.motionCache = null;
  this.activeMotions = [];
}
SkelAnimPawn.prototype = Object.create(Pawn.prototype);

SkelAnimPawn.prototype._getMotionData = VIRTUAL_FUNC;

SkelAnimPawn.prototype._setSkeleton = function(skelData) {
  this.skel = skelData.create(this.rootObj);

  // Reset the loaded motions if the skeleton changed...
  this.motionCache = {};
  this.activeMotions = [];

  // Let everyone waiting know!
  for (var i = 0; i < this.skelWaiters.length; ++i) {
    this.skelWaiters[i]();
  }
  this.skelWaiters = [];
};

SkelAnimPawn.prototype._waitSkeleton = function(callback) {
  if (this.skel) {
    callback();
  } else {
    this.skelWaiters.push(callback);
  }
};

SkelAnimPawn.prototype._getMotion = function(motionIdx, callback) {
  // We check the cache after the getMotionData to avoid synchronization
  //   issues from calling this method twice in a row for the same motion.
  this._getMotionData(motionIdx, function(animData) {
    this._waitSkeleton(function() {
      if (this.motionCache[motionIdx]) {
        callback(this.motionCache[motionIdx]);
        return;
      }

      var anim = new SkeletonAnimator(this.skel, animData);
      this.motionCache[motionIdx] = anim;
      callback(anim);
    }.bind(this));
  }.bind(this));
};

SkelAnimPawn.prototype.playMotion = function(motionIdx, timeScale, loop, callback) {
  this._getMotion(motionIdx, function(anim) {
    var activeIdx = this.activeMotions.indexOf(anim);
    if (activeIdx !== -1) {
      this.activeMotions.splice(activeIdx, 1);
    }

    anim.timeScale = timeScale;
    anim.loop = loop;
    if (!anim.isPlaying || anim.isPaused) {
      anim.play(0, 0);
    }

    // If no motions were previously playing, immediately activate this one.
    if (this.activeMotions.length === 0) {
      anim.weight = 1;
    }

    this.activeMotions.unshift(anim);

    anim.clearEventListeners();
    if (callback) {
      callback(anim);
    }
  }.bind(this));
};

SkelAnimPawn.prototype.update = function(delta) {
  // Update Animation Blending
  var blendWeightDelta = 6 * delta;
  if (this.activeMotions.length >= 1) {
    var activeMotion = this.activeMotions[0];
    if (activeMotion.weight < 1) {
      activeMotion.weight += blendWeightDelta;
      if (activeMotion.weight > 1) {
        activeMotion.weight = 1;
      }
    }

    for (var i = 1; i < this.activeMotions.length; ++i) {
      var motion = this.activeMotions[i];
      motion.weight -= blendWeightDelta;

      // If we're done blending away, stop the motion and remove
      //  it from the list of motions.
      if (motion.weight <= 0) {
        motion.stop();
        this.activeMotions.splice(i, 1);
        --i;
      }
    }
  }

  return Pawn.prototype.update.call(this, delta);
};

module.exports = SkelAnimPawn;
