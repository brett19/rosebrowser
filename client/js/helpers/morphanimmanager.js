'use strict';

/*
  Note that pretty much everything in this file is purpose built for doing
  vertex animation in such a way that all animations are always running, run
  in sync, and all copies of the same vertex animated mesh share the same data.
  This means it is not generalized at all, and abuses various object properties
  to store state information which would normally be abstracted elsewhere for
  non-shared animating, or controllable animations (play,pause,rewind).
 */

function MorphAnimManager() {
  this.anims = {};
  this.cache = new IndexedCache(this._loadOne.bind(this));
}

// Loads one
MorphAnimManager.prototype._loadOne = function(animIdx, callback) {
  var animInfo = this.anims[animIdx];

  var texture = ROSETexLoader.load(animInfo.texPath);
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapS = THREE.RepeatWrapping;
  var mat = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture});

  if (animInfo.twoSided) {
    mat.side = THREE.DoubleSide;
  }
  if (animInfo.alphaTest) {
    mat.alphaTest = 0.5;
  }

  mat.transparent = true;
  mat.opacity = animInfo.alpha;
  mat.depthTest = animInfo.depthTest;
  mat.depthWrite = animInfo.depthWrite;
  mat.blending = THREE.CustomBlending;
  mat.blendEquation = convertZnzinBlendOp(animInfo.blendOp);
  mat.blendSrc = convertZnzinBlendType(animInfo.blendSrc);
  mat.blendDst = convertZnzinBlendType(animInfo.blendDst);

  Mesh.load(animInfo.meshPath, function(geom) {
    geom.dynamic = true;

    Animation.load(animInfo.animPath, function(animData) {
      // Validate the animation
      for (var l = 0; l < animData.channels.length; ++l) {
        var channel = animData.channels[l];
        if (channel.type === Animation.CHANNEL_TYPE.Position) {
        } else if (channel.type === Animation.CHANNEL_TYPE.Normal) {
        } else if (channel.type === Animation.CHANNEL_TYPE.Uv1) {
        } else {
          console.warn('Encountered unhandled morph animation channel type:', channel.type);
        }
      }

      console.log(animData);

      // Create an animator to tick every frame
      var anim = new _VertexAnimUpdater(geom, animData);
      THREE.AnimationHandler.play(anim);

      // Force an update now as the mesh does not always match frame 0
      anim.update(0);

      if (callback) {
        callback({
          geom: geom,
          mat: mat,
          anim: anim
        });
      }
    });
  });

};

MorphAnimManager.prototype.create = function(animIdx, callback) {
  var obj = new THREE.Object3D();

  this.cache.get(animIdx, function(data) {
    var mesh = new THREE.Mesh(data.geom, data.mat);
    obj.add(mesh);

    if (callback) {
      callback();
    }
  });

  return obj;
};

/**
 * Load helper so the MorphAnimManager can be controlled by the GDM.
 *
 * @param path Path to STB listing the morph objects
 * @param callback
 */
MorphAnimManager.load = function(path, callback) {
  var data = new MorphAnimManager();

  var waitAll = new MultiWait();
  var dataTableWait = waitAll.one();
  DataTable.load(path, function(qdata) {
    for (var i = 0; i < qdata.rows.length; ++i) {
      var animInfo = qdata.rows[i];
      if (animInfo[1] && animInfo[3]) {
        data.anims[i] = {
          meshPath: animInfo[1],
          animPath: animInfo[2],
          texPath: animInfo[3],
          alpha: parseFloat(animInfo[4]),
          twoSided: parseInt(animInfo[5]) !== 0,
          alphaTest: parseInt(animInfo[6]) !== 0,
          depthTest: parseInt(animInfo[7]) !== 0,
          depthWrite: parseInt(animInfo[8]) !== 0,
          blendSrc: parseInt(animInfo[9]),
          blendDst: parseInt(animInfo[10]),
          blendOp: parseInt(animInfo[11])
        };
      }
    }
    dataTableWait();
  });
  waitAll.wait(function() {
    callback(data);
  });
};

function _VertexAnimUpdater(geom, anim) {
  this.geom = geom;
  this.anim = anim;
  this.time = 0;
  this.frame = 0;
}

_VertexAnimUpdater.prototype.resetBlendWeights = function() {
};

_VertexAnimUpdater.prototype.update = function(delta) {
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

    if (channel.type === Animation.CHANNEL_TYPE.Position) {
      console.log('channel', i, 'frame', this.frame, 'position', frame);
      var attrib = this.geom.attributes['position'];
      attrib.array[channel.index * 3 + 0] = frame.x;
      attrib.array[channel.index * 3 + 1] = frame.y;
      attrib.array[channel.index * 3 + 2] = frame.z;
      attrib.needsUpdate = true;
    } else if (channel.type === Animation.CHANNEL_TYPE.Uv1) {
      var attrib = this.geom.attributes['uv'];
      attrib.array[channel.index * 2 + 0] = frame.x;
      attrib.array[channel.index * 2 + 1] = frame.y;
      attrib.needsUpdate = true;
    }
  }
  /*
  var posAttrib = this.geom.attributes['position'];
  posAttrib.array = this.frames[this.frame];
  posAttrib.needsUpdate = true;
  */
};
