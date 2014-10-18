var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {SkeletonData.Bone[]} bones
 * @property {SkeletonData.Bone[]} dummies
 */
var SkeletonData = function() {
  this.bones = [];
  this.dummies = [];
};


/**
 * @constructor
 * @property {Number} parent
 * @property {String} name
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} rotation
 */
SkeletonData.Bone = function() {
};


/**
 * Creates a skeleton object from this skeleton data.
 */
SkeletonData.prototype.create = function(rootObj) {
  var parts = [];
  var bones = [];
  var dummies = [];

  var fakeRoot = new THREE.Object3D();

  for (var i = 0; i < this.bones.length; ++i) {
    var b = this.bones[i];

    var boneX = new THREE.Bone(rootObj);
    boneX.name = b.name;
    boneX.position.copy(b.position);
    boneX.quaternion.copy(b.rotation);
    boneX.scale.set(1, 1, 1);

    if (b.parent == -1) {
      fakeRoot.add(boneX);
    } else {
      bones[b.parent].add(boneX);
    }

    bones.push(boneX);
    parts.push(boneX);
  }

  for (var j = 0; j < this.dummies.length; ++j) {
    var d = this.dummies[j];

    var dummyX = new THREE.Object3D(rootObj);
    dummyX.name = d.name;
    dummyX.position.copy(d.position);
    dummyX.quaternion.copy(d.rotation);
    dummyX.scale.set(1,1,1);

    parts[d.parent].add(dummyX);

    dummies.push(dummyX);
    parts.push(dummyX);
  }

  var skel = new THREE.Skeleton(bones);
  skel.dummies = dummies;

  // The root object has to be fully updated!
  fakeRoot.updateMatrixWorld();

  // Generate the inverse matrices for skinning
  skel.calculateInverses();

  fakeRoot.remove(bones[0]);
  rootObj.add(bones[0]);

  return skel;
};


/**
 * @callback Skeleton~onLoad
 * @param {SkeletonData} skeleton
 */

/**
 * @param {String} path
 * @param {Skeleton~onLoad} callback
 */
SkeletonData.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var bones, dummies, i, magic, version;
    var data = new SkeletonData();

    magic = rh.readStrLen(7);
    if (magic === 'ZMD0002') {
      version = 2;
    } else if (magic === 'ZMD0003') {
      version = 3;
    } else {
      throw 'Unexpected ZMD magic header ' + magic + ' in ' + path;
    }

    bones = rh.readUint32();
    for (var i = 0; i < bones; ++i) {
      var bone = new SkeletonData.Bone();
      bone.parent   = rh.readUint32();
      bone.name     = rh.readStr();
      bone.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      bone.rotation = rh.readQuatwxyz();

      if (i == 0) {
        bone.parent = -1;
      }

      data.bones.push(bone);
    }

    dummies = rh.readUint32();
    for (i = 0; i < dummies; ++i) {
      var dummy = new SkeletonData.Bone();
      dummy.name     = rh.readStr();
      dummy.parent   = rh.readUint32();
      dummy.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);

      if (version === 3) {
        dummy.rotation = rh.readQuatwxyz();
      } else {
        dummy.rotation = new THREE.Quaternion(0,0,0,1);
      }

      data.dummies.push(dummy);
    }

    callback(data);
  });
};

module.exports = SkeletonData;
