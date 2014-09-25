'use strict';

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
  var animD = SkeletonAnimator._createThreeAnimation(skeleton, animationData);

  // Create the actual animation, we use a dummy root object since we manually
  //   configure the animated hierarchy below.
  THREE.Animation.call(this, {children: []}, animD);
  this.hierarchy = skeleton.bones;
}

SkeletonAnimator.prototype = Object.create( THREE.Animation.prototype );

/**
 * An index of all created skeleton animators, incrememnted for each
 * to ensure a unique animation name for all.
 *
 * @type {number}
 * @private
 */
SkeletonAnimator._animIdx = 1;

/**
 * @param skeleton
 * @param {AnimationData} animationData
 * @private
 */
SkeletonAnimator._createThreeAnimation = function(skeleton, animationData) {
  var animD = {
    name: 'SkelAnim_' + SkeletonAnimator._animIdx++,
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

  return animD;
};
