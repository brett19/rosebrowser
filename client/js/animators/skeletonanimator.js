var Animator = require('./animator');

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
  Animator.call(this, skeleton.bones, animationData);
}

SkeletonAnimator.prototype = Object.create(Animator.prototype);

module.exports = SkeletonAnimator;
