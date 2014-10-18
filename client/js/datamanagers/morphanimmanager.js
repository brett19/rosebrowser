/*
  Note that pretty much everything in this file is purpose built for doing
  world morph animations such that all animations instantiated are always
  running and always play in sync (all instances of a morph object share the
  same underlying geometry.
 */

/**
 * Handles the games morph object list and handles the creation and cacheing
 * of all the related geometry and animations.
 *
 * @constructor
 */
function MorphAnimManager() {
  this.anims = {};
  this.cache = new IndexedCache(this._loadOne.bind(this));
}

/**
 * @param {number} animIdx
 * @param {Function} callback
 * @private
 */
MorphAnimManager.prototype._loadOne = function(animIdx, callback) {
  var animInfo = this.anims[animIdx];

  var texture = TextureManager.load(animInfo.texPath);
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
    AnimationData.load(animInfo.animPath, function(animData) {
      var anim = new GeometryAnimator(geom, animData);
      anim.play();

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

/**
 * @param {number} animIdx
 * @param {Function} callback
 * @returns {THREE.Object3D}
 */
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
 * @param {string} path
 * Path to STB listing the morph objects
 * @param {Function} callback
 */
MorphAnimManager.load = function(path, callback) {
  var data = new MorphAnimManager();

  var waitAll = new MultiWait();
  var dataTableWait = waitAll.one();
  DataTable.load(path, function(qdata) {
    for (var i = 0; i < qdata.rowCount; ++i) {
      var animInfo = qdata.row(i);
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

module.exports = MorphAnimManager;
