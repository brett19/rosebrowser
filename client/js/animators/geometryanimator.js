'use strict';

/**
 * An Animator class for animating a BufferGeometry based on an AnimationData.
 *
 * @constructor
 * @param {THREE.BufferGeometry} geometry
 * The geometry data to animation.  Note that geometry data will be modified
 * by this class directly and may affect multiple Mesh instances.
 * @param {AnimationData} animationData
 * The AnimationData to animate the geometry with.
 */
function GeometryAnimator(geom, anim) {
  this.geom = geom;
  this.anim = anim;
  this.time = 0;
  this.frame = 0;
  this.playing = false;

  // Validate the animation
  for (var l = 0; l < anim.channels.length; ++l) {
    var channel = anim.channels[l];
    if (channel.type === AnimationData.CHANNEL_TYPE.Position) {
      if (!this.geom.attributes['position']) {
        console.warn('Encountered vertex position animation with no attribute on mesh.');
        this.anim = null;
        break;
      }
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Alpha) {
      // Alpha doesn't exist on ZMS, so we manually create it when needed.
      if (!this.geom.attributes['alpha']) {
        var posByteLen = this.geom.attributes['position'].array.byteLength;
        var vertexCount = posByteLen / 4 / 3;
        var alphaAttrib = new THREE.BufferAttribute(new Float32Array(vertexCount), 1);
        this.geom.addAttribute('alpha', alphaAttrib);
      }
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Normal) {
      // Normals are disabled at the moment, so ignore them.
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Uv1) {
      if (!this.geom.attributes['uv']) {
        console.warn('Encountered vertex uv animation with no attribute on mesh.');
        this.anim = null;
        break;
      }
    } else {
      console.warn('Encountered unhandled vertex animation channel type:', channel.type);
    }
  }
}

GeometryAnimator.prototype.resetBlendWeights = function() {
};

GeometryAnimator.prototype.update = function(delta) {
  if (!this.playing || !this.anim) {
    return;
  }

  this.time += delta;

  var newFrame = Math.floor(this.time * this.anim.fps);
  while (newFrame >= this.anim.frameCount) {
    this.time -= this.anim.frameCount / this.anim.fps;
    newFrame -= this.anim.frameCount;
  }
  if (newFrame === this.frame) {
    return;
  }
  this.frame = newFrame;

  for (var i = 0; i < this.anim.channels.length; ++i) {
    var channel = this.anim.channels[i];
    var frame = channel.frames[this.frame];

    if (channel.type === AnimationData.CHANNEL_TYPE.Position) {
      var attrib = this.geom.attributes['position'];
      attrib.array[channel.index * 3 + 0] = frame.x;
      attrib.array[channel.index * 3 + 1] = frame.y;
      attrib.array[channel.index * 3 + 2] = frame.z;
      attrib.needsUpdate = true;
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Alpha) {
      var attrib = this.geom.attributes['alpha'];
      attrib.array[channel.index] = frame;
      attrib.needsUpdate = true;
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Uv1) {
      var attrib = this.geom.attributes['uv'];
      attrib.array[channel.index * 2 + 0] = frame.x;
      attrib.array[channel.index * 2 + 1] = frame.y;
      attrib.needsUpdate = true;
    }
  }
};

/**
 * Starts playing the animation.
 * @param {number} [loopCount]
 */
GeometryAnimator.prototype.play = function(loopCount) {
  if (this.playing) {
    return;
  }
  this.playing = true;

  THREE.AnimationHandler.play( this );
};

/**
 * Stops the animation
 */
GeometryAnimator.prototype.stop = function() {
  if (!this.playing) {
    return;
  }
  this.playing = false;

  THREE.AnimationHandler.stop( this );
};
