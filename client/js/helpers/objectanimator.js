'use strict';

/**
 * An Animator class for animating Object3D's based on an AnimationData.
 *
 * Note: Internally makes use of the THREE.Animation class.
 *
 * @param object
 * @param {AnimationData} animationData
 * @constructor
 */
function ObjectAnimator(object, animationData) {
  this.animation =
      ObjectAnimator._createThreeAnimation(object, animationData);
}

/**
 * @param [startTime]
 */
ObjectAnimator.prototype.play = function(startTime) {
  this.animation.play(startTime);
};


ObjectAnimator.prototype.pause = function() {
  this.animation.pause();
};

ObjectAnimator.prototype.stop = function() {
  this.animation.stop();
};

/**
 * @param skeleton
 * @param {AnimationData} animationData
 * @private
 */
ObjectAnimator._createThreeAnimation = function(object, animationData) {
  var animD = {
    name: name,
    fps: animationData.fps,
    length: animationData.frameCount / animationData.fps,
    hierarchy: []
  };

  var animT = {
    keys: []
  };
  var b = object;
  for (var j = 0; j < animationData.frameCount; ++j) {
    animT.keys.push({
      time: j / animationData.fps,
      pos: [b.position.x, b.position.y, b.position.z],
      rot: [b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w],
      scl: [b.scale.x, b.scale.y, b.scale.z]
    });
  }
  animD.hierarchy.push(animT);

  // Apply the channel transformations
  for (var j = 0; j < animationData.channels.length; ++j) {
    var c = animationData.channels[j];
    for (var i = 0; i < animationData.frameCount; ++i) {
      if (c.index != 0) {
        console.log('bad index');
      }
      var thisKey = animD.hierarchy[c.index].keys[i];
      switch (c.type) {
        case AnimationData.CHANNEL_TYPE.Position:
          thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
          break;
        case AnimationData.CHANNEL_TYPE.Rotation:
          thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
          break;
        case AnimationData.CHANNEL_TYPE.Scale:
          thisKey.scl = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
          break;
      }
    }
  }

  // Create the actual animation, we use a dummy root object since we manually
  //   configure the animated hierarchy below.
  var anim = new THREE.Animation({children: []}, animD);
  anim.hierarchy = [object];
  return anim;
};
