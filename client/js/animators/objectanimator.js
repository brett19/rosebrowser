var Animator = require('./animator');

/**
 * An Animator class for animating Object3D's based on an AnimationData.
 *
 * @constructor
 * @param {THREE.Object3D} object
 * The object to animate.
 * @param {AnimationData} animationData
 * The AnimationData to animate the geometry with.
 */
function ObjectAnimator(object, animationData) {
  Animator.call(this, [object], animationData);
}
ObjectAnimator.prototype = Object.create(Animator.prototype);

module.exports = ObjectAnimator;
