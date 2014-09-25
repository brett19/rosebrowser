'use strict';

/**
 * An Animator class for animating Skeleton's based on an AnimationData.
 *
 * Note: Internally makes use of the THREE.Animation class.
 *
 * @param skeleton
 * @param {AnimationData} animationData
 * @constructor
 */
function SkeletonAnimator(skeleton, animationData) {
  this.animation =
      SkeletonAnimator._createThreeAnimation(skeleton, animationData);
}

/**
 * @param [startTime]
 */
SkeletonAnimator.prototype.play = function(startTime) {
  this.animation.play(startTime);
};


SkeletonAnimator.prototype.pause = function() {
  this.animation.pause();
};

SkeletonAnimator.prototype.stop = function() {
  this.animation.stop();
};

/**
 * @param skeleton
 * @param {AnimationData} animationData
 * @private
 */
SkeletonAnimator._createThreeAnimation = function(skeleton, animationData) {
  var animD = {
    name: name,
    fps: animationData.fps,
    length: animationData.frameCount / animationData.fps,
    hierarchy: []
  };

  // Set up all the base bone animations
  for (var i = 0; i < skeleton.bones.length; ++i) {
    var b = skeleton.bones[i];

    var animT = {
      parent: i,
      keys: []
    };
    for (var j = 0; j < animationData.frameCount; ++j) {
      animT.keys.push({
        time: j / animationData.fps,
        pos: [b.position.x, b.position.y, b.position.z],
        rot: [b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w],
        scl: [1, 1, 1]
      });
    }
    animD.hierarchy.push(animT);
  }

  // Apply the channel transformations
  for (var j = 0; j < animationData.channels.length; ++j) {
    var c = animationData.channels[j];
    for (var i = 0; i < animationData.frameCount; ++i) {
      var thisKey = animD.hierarchy[c.index].keys[i];
      switch (c.type) {
        case AnimationData.CHANNEL_TYPE.Position:
          thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
          break;
        case AnimationData.CHANNEL_TYPE.Rotation:
          thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
          break;
      }
    }
  }

  // Create the actual animation, we use a dummy root object since we manually
  //   configure the animated hierarchy below.
  var anim = new THREE.Animation({children: []}, animD);
  anim.hierarchy = skeleton.bones;
  return anim;
};
