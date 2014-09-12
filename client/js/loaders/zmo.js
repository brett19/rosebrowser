
var ZMOCTYPE = {
  None: 1 << 0,
  Position: 1 << 1,
  Rotation: 1 << 2
};
function ZMOAnimation() {
  this.fps = 0;
  this.frameCount = 0;
  this.channels = [];
}
ZMOAnimation.prototype.createForSkeleton = function(name, rootObj, skel) {
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
      if (c.type == ZMOCTYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == ZMOCTYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = skel.bones;
  return anim;
};
ZMOAnimation.prototype.createForStatic = function(name, rootObj) {
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
      if (c.type == ZMOCTYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == ZMOCTYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      } else if (c.type == ZMOCTYPE.Scale) {
        thisKey.scl = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = [rootObj];
  return anim;
};

var ZMOLoader = {};
ZMOLoader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var anim = new ZMOAnimation();

    rh.skip(8);

    anim.fps = rh.readUint32();
    anim.frameCount = rh.readUint32();
    var channelCount = rh.readUint32();

    var channelData = [];
    for (var i = 0; i < channelCount; ++i) {
      var channelType = rh.readUint32();
      var channelIndex = rh.readUint32();
      channelData.push({type: channelType, index: channelIndex, frames: []});
    }

    for (var i = 0; i < anim.frameCount; ++i) {
      for (var j = 0; j < channelCount; ++j) {
        if (channelData[j].type == ZMOCTYPE.Position) {
          channelData[j].frames.push(rh.readVector3().multiplyScalar(ZZ_SCALE_IN));
        } else if (channelData[j].type == ZMOCTYPE.Rotation) {
          channelData[j].frames.push(rh.readBadQuat());
        }
      }
    }
    anim.channels = channelData;

    callback(anim);
  });
};
