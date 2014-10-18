var Animator = require('./animator');

var CAMANIMPLAYSTATE = {
  Stopped: 0,
  Playing: 1
};

/**
 * A class for animating a camera object based on AnimationData.
 *
 * @constructor
 * @param {THREE.Camera} camera
 * The Camera object to animate.
 * @param {AnimationData} zmoData
 * The AnimationData to animate against.
 * @param {THREE.Vector3} [rootPos]
 * The root position for all animation positions to be relative from.
 */
function CameraAnimator(camera, animData, rootPos) {
  EventEmitter.call(this);

  this.time = 0;
  this.state = CAMANIMPLAYSTATE.Stopped;
  this.camera = camera;
  this.data = animData;
  this.loopCount = 0;
  this.timeScale = 1;
  this.rootPos = rootPos ? rootPos : new THREE.Vector3(0, 0, 0);
  this.length = this.data.frameCount / this.data.fps;
  if (this.data.channels.length !== 4) {
    throw new Error('Camera ZMO has wrong number of channels');
  }
}
CameraAnimator.prototype = new EventEmitter();

/**
 * Used by the THREE.AnimationHandler for other kinds of animations.
 * @private
 */
CameraAnimator.prototype.resetBlendWeights = function() {
  // Pointless but neccessary for this version of ThreeJS
};

/**
 * Plays this animation
 *
 * @param {number} [loopCount]
 * The number of times to loop this animation.  Default is Infinite.
 */
CameraAnimator.prototype.play = function(loopCount) {
  this.loopCount = loopCount !== undefined ? loopCount : -1;
  this.state = CAMANIMPLAYSTATE.Playing;

  THREE.AnimationHandler.play( this );

  this.emit('played');
};

/**
 * Stops this animation.
 */
CameraAnimator.prototype.stop = function() {
  this.state = CAMANIMPLAYSTATE.Stopped;

  THREE.AnimationHandler.stop( this );

  this.emit('stopped');
};

// TODO: There is a bug here related to calculating the current frame.
//   Currently it ends up such that this.length means back at frame 0.
//   However it should be that this.length means exactly the final frame.
function _interpFrame(frames, frameBase, weight) {
  if (weight < 0.0001) {
    return frames[frameBase].clone();
  }
  var frame0 = frameBase;
  var frame1 = frameBase + 1;
  if (frame1 >= frames.length) {
    frame1 -= frames.length;
  }
  return frames[frame0].clone().lerp(frames[frame1], weight);
}

/**
 * Ticks the animations state.
 * @param {number} delta
 * @private
 */
CameraAnimator.prototype.update = function(delta) {
  if (this.state !== CAMANIMPLAYSTATE.Playing) {
    return;
  }

  this.time += delta * this.timeScale;

  while (this.time >= this.length) {
    if (this.loopCount === 1) {
      var lastFrameTime = this.length - (1 / this.data.fps);
      if (this.time >= lastFrameTime) {
        this.time = lastFrameTime;
        this.state = CAMANIMPLAYSTATE.Stopped;
      }
    } else {
      if (this.time >= this.length) {
        if (this.loopCount !== -1) {
          this.loopCount--;
        }
        this.time -= this.length;
      }
    }
  }

  var frameNum = Math.floor(this.time * this.data.fps);
  var blendWeight = (this.time - (frameNum / this.data.fps)) * this.data.fps;

  var channels = this.data.channels;
  var eyePos = _interpFrame(channels[0].frames, frameNum, blendWeight);
  var targetPos = _interpFrame(channels[1].frames, frameNum, blendWeight);
  var upPos = _interpFrame(channels[2].frames, frameNum, blendWeight);

  // Re-scale up position back to default
  upPos.multiplyScalar(ZZ_SCALE_OUT);

  // Move Eye and Target positions based on root position
  eyePos.add(this.rootPos);
  targetPos.add(this.rootPos);

  // Update the assigned camera
  this.camera.up.copy(upPos);
  this.camera.position.copy(eyePos);
  this.camera.lookAt(targetPos);

  if (this.state === CAMANIMPLAYSTATE.Stopped) {
    this.emit('complete');
  }
};

module.exports = CameraAnimator;
