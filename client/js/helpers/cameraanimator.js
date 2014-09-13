'use strict';

var CAMANIMPLAYSTATE = {
  Stopped: 0,
  Playing: 1
};

function CameraAnimator(camera, zmoData, rootPos) {
  this.time = 0;
  this.state = CAMANIMPLAYSTATE.Stopped;
  this.camera = camera;
  this.data = zmoData;
  this.loopCount = 0;
  this.rootPos = rootPos ? rootPos : new THREE.Vector3(0, 0, 0);
  this.length = this.data.frameCount / this.data.fps;
  if (this.data.channels.length !== 4) {
    throw new Error('Camera ZMO has wrong number of channels');
  }
}

CameraAnimator.prototype.resetBlendWeights = function() {
  // Pointless but neccessary for this version of ThreeJS
};

CameraAnimator.prototype.play = function(loopCount) {
  this.loopCount = loopCount !== undefined ? loopCount : -1;
  this.state = CAMANIMPLAYSTATE.Playing;

  THREE.AnimationHandler.play( this );
};

CameraAnimator.prototype.stop = function() {
  THREE.AnimationHandler.stop( this );
};

// TODO: There is a bug here related to calculating the current frame.
//   Currently it ends up such that this.length means back at frame 0.
//   However it should be that this.length means exactly the final frame.
function _interpFrame(frames, frameBase, weight) {
  if (weight < 0.0001) {
    return frames[frameBase];
  }
  var frame0 = frameBase;
  var frame1 = frameBase + 1;
  if (frame1 >= frames.length) {
    frame1 -= frames.length;
  }
  return frames[frame0].clone().lerp(frames[frame1], weight);
}
CameraAnimator.prototype.update = function(delta) {
  if (this.state !== CAMANIMPLAYSTATE.Playing) {
    return;
  }

  this.time += delta;

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
};
