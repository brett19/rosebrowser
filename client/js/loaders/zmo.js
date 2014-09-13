/**
 * @constructor
 * @property {Number} fps
 * @property {Number} frameCount
 * @property {Animation.Channel[]} channels
 */
var Animation = function() {
  this.fps = 0;
  this.frameCount = 0;
  this.channels = [];
}


/**
 * @constructor
 * @param {Number} type
 * @param {Number} index
 * @property {Number} type
 * @property {Number} index
 * @property {Object[]} frames
 */
Animation.Channel = function(type, index) {
  this.type = type;
  this.index = index;
  this.frames = [];
};


/**
 * @enum {Number}
 * @readonly
 */
Animation.CHANNEL_TYPE = {
  None: 1 << 0,
  Position: 1 << 1,
  Rotation: 1 << 2
};


Animation.prototype.createForSkeleton = function(name, rootObj, skel) {
  var animD = {
    name: name,
    fps: this.fps,
    length: this.frameCount / this.fps,
    hierarchy: []
  };

  // Set up all the base bone animations
  for (var i = 0; i < skel.bones.length; ++i) {
    var b = skel.bones[i];

    var animT = {
      parent: i,
      keys: []
    };
    for (var j = 0; j < this.frameCount; ++j) {
      animT.keys.push({
        time: j / this.fps,
        pos: [b.position.x, b.position.y, b.position.z],
        rot: [b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w],
        scl: [1, 1, 1]
      });
    }
    animD.hierarchy.push(animT);
  }

  // Apply the channel transformations
  for (var j = 0; j < this.channels.length; ++j) {
    var c = this.channels[j];
    for (var i = 0; i < this.frameCount; ++i) {
      var thisKey = animD.hierarchy[c.index].keys[i];
      if (c.type == Animation.CHANNEL_TYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == Animation.CHANNEL_TYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = skel.bones;
  return anim;
};

Animation.prototype.createForStatic = function(name, rootObj) {
  var animD = {
    name: name,
    fps: this.fps,
    length: this.frameCount / this.fps,
    hierarchy: []
  };

  var animT = {
    parent: i,
    keys: []
  };
  var b = rootObj;
  for (var j = 0; j < this.frameCount; ++j) {
    animT.keys.push({
      time: j / this.fps,
      pos: [b.position.x, b.position.y, b.position.z],
      rot: [b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w],
      scl: [b.scale.x, b.scale.y, b.scale.z]
    });
  }
  animD.hierarchy.push(animT);

  // Apply the channel transformations
  for (var j = 0; j < this.channels.length; ++j) {
    var c = this.channels[j];
    for (var i = 0; i < this.frameCount; ++i) {
      if (c.index != 0) {
        console.log('bad index');
      }
      var thisKey = animD.hierarchy[c.index].keys[i];
      if (c.type == Animation.CHANNEL_TYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == Animation.CHANNEL_TYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      } else if (c.type == Animation.CHANNEL_TYPE.Scale) {
        thisKey.scl = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = [rootObj];
  return anim;
};


/**
 * @callback Animation~onLoad
 * @param {Animation} animation
 */

/**
 * @param {String} path
 * @param {Animation~onLoad} callback
 */
Animation.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var channels, i, j, magic;
    var data = new Animation();

    magic = rh.readStrLen(7);
    rh.skip(1);

    if (magic !== 'ZMO0002') {
      throw 'Unexpected ZMO magic header ' + magic + ' in ' + path;
    }

    data.fps = rh.readUint32();
    data.frameCount = rh.readUint32();

    channels = rh.readUint32();
    for (i = 0; i < channels; ++i) {
      var type  = rh.readUint32();
      var index = rh.readUint32();
      data.channels.push(new Animation.Channel(type, index));
    }

    for (i = 0; i < data.frameCount; ++i) {
      for (j = 0; j < channels; ++j) {
        var frame;

        switch (data.channels[j].type) {
        case Animation.CHANNEL_TYPE.Position:
          frame = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
          break;
        case Animation.CHANNEL_TYPE.Rotation:
          frame = rh.readBadQuat();
          break;
        default:
          throw 'Unexpected ZMO channel type ' + data.channels[j].type + ' in ' + path;
        }

        data.channels[j].frames.push(frame);
      }
    }

    callback(data);
  });
};
