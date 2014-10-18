var Animator = require('./animator');

/**
 * An Animator class for animating a BufferGeometry based on an AnimationData.
 *
 * @constructor
 * @param {THREE.BufferGeometry} geometry
 * The geometry data to animation.  Note that geometry data will be modified
 * by this class directly and may affect multiple Mesh instances.
 * @param {AnimationData} animData
 * The AnimationData to animate the geometry with.
 */
function GeometryAnimator(geom, animData) {
  Animator.call(this, [geom], animData);

  // Validate the animation
  for (var l = 0; l < animData.channels.length; ++l) {
    var channel = animData.channels[l];
    if (channel.type === AnimationData.CHANNEL_TYPE.Position) {
      if (!geom.attributes['position']) {
        console.warn('Encountered vertex position animation with no attribute on mesh.');
        this.anim = null;
        break;
      }
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Alpha) {
      // Alpha doesn't exist on ZMS, so we manually create it when needed.
      if (!geom.attributes['alpha']) {
        var posByteLen = geom.attributes['position'].array.byteLength;
        var vertexCount = posByteLen / 4 / 3;
        var alphaAttrib = new THREE.BufferAttribute(new Float32Array(vertexCount), 1);
        geom.addAttribute('alpha', alphaAttrib);
      }
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Normal) {
      // Normals are disabled at the moment, so ignore them.
    } else if (channel.type === AnimationData.CHANNEL_TYPE.Uv1) {
      if (!geom.attributes['uv']) {
        console.warn('Encountered vertex uv animation with no attribute on mesh.');
        this.anim = null;
        break;
      }
    } else {
      console.warn('Encountered unhandled vertex animation channel type:', channel.type);
    }
  }

}
GeometryAnimator.prototype = Object.create(Animator.prototype);

GeometryAnimator.prototype._applyChannel = function(index, type, value) {
  var geom = this.objects[0];
  if (type === AnimationData.CHANNEL_TYPE.Position) {
    var attrib = geom.attributes['position'];
    attrib.array[index * 3 + 0] = value.x;
    attrib.array[index * 3 + 1] = value.y;
    attrib.array[index * 3 + 2] = value.z;
    attrib.needsUpdate = true;
  } else if (type === AnimationData.CHANNEL_TYPE.Alpha) {
    var attrib = geom.attributes['alpha'];
    attrib.array[index] = value;
    attrib.needsUpdate = true;
  } else if (type === AnimationData.CHANNEL_TYPE.Uv1) {
    var attrib = geom.attributes['uv'];
    attrib.array[index * 2 + 0] = value.x;
    attrib.array[index * 2 + 1] = value.y;
    attrib.needsUpdate = true;
  }
};

module.exports = GeometryAnimator;
