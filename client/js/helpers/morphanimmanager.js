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
  var mat = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture});

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
  mat.blendEquation = convertZnzinBlendOp(animInfo.blendOp);
  mat.blendSrc = convertZnzinBlendType(animInfo.blendSrc);
  mat.blendDst = convertZnzinBlendType(animInfo.blendDst);

  Mesh.load(animInfo.meshPath, function(geom) {
    Animation.load(animInfo.animPath, function(animData) {
      var meshPosAttrib = geom.attributes['position'];

      var posFrames = [];
      for (var i = 0; i < animData.frameCount; ++i) {
        var newFrame = new Float32Array(meshPosAttrib.array.buffer.slice(0));
        posFrames.push(newFrame);
      }

      for (var j = 0; j < animData.channels.length; ++j) {
        var channel = animData.channels[j];
        if (channel.type !== Animation.CHANNEL_TYPE.Position) {
          console.warn('Encountered non-positional channel in morph animation.');
          continue;
        }

        var vertIndex = channel.index;
        for (var k = 0; k < channel.frames.length; ++k) {
          posFrames[k][vertIndex * 3 + 0] = channel.frames[k].x;
          posFrames[k][vertIndex * 3 + 1] = channel.frames[k].y;
          posFrames[k][vertIndex * 3 + 2] = channel.frames[k].z;
        }
      }

      // Create an animator to tick every frame
      var anim = new _VertexAnimUpdater(geom, posFrames, animData.fps);
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
          blendDest: parseInt(animInfo[10]),
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

function _VertexAnimUpdater(geom, frames, fps) {
  this.geom = geom;
  this.frames = frames;
  this.fps = fps;
  this.time = 0;
  this.frame = 0;
}

_VertexAnimUpdater.prototype.resetBlendWeights = function() {
};

_VertexAnimUpdater.prototype.update = function(delta) {
  this.time += delta;

  var newFrame = Math.floor(this.time * this.fps);
  while (newFrame >= this.frames.length) {
    this.time -= this.frames.length / this.fps;
    newFrame -= this.frames.length;
  }
  if (newFrame === this.frame) {
    return;
  }
  this.frame = newFrame;

  var posAttrib = this.geom.attributes['position'];
  posAttrib.array = this.frames[this.frame];
  posAttrib.needsUpdate = true;
};
