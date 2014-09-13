/**
 * @constructor
 * @property {Skeleton.Bone[]} bones
 * @property {Skeleton.Bone[]} dummies
 */
var Skeleton = function() {
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
Skeleton.Bone = function() {
};


/**
 * Creates a skeleton object from this skeleton data.
 */
Skeleton.prototype.create = function(rootObj) {
  var bones = [];

  var fakeRoot = new THREE.Object3D();

  for (var i = 0; i < this.bones.length; ++i) {
    var b = this.bones[i];

    var boneX = new THREE.Bone(rootObj);
    boneX.name = b.name;
    boneX.position.set(b.position.x, b.position.y, b.position.z);
    boneX.quaternion.set(b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w);
    boneX.scale.set(1, 1, 1);

    if (b.parent == -1) {
      fakeRoot.add(boneX);
    } else {
      bones[b.parent].add(boneX);
    }

    bones.push(boneX);
  }

  var skel = new THREE.Skeleton(bones);

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
 * @param {Skeleton} skeleton
 */

/**
 * @param {String} path
 * @param {Skeleton~onLoad} callback
 */
Skeleton.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var bones, dummies, i, magic, version;
    var data = new Skeleton();

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
      var bone = new Skeleton.Bone();
      bone.parent   = rh.readUint32();
      bone.name     = rh.readStr();
      bone.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      bone.rotation = rh.readBadQuat();

      if (i == 0) {
        bone.parent = -1;
      }

      data.bones.push(bone);
    }

    dummies = rh.readUint32();
    for (i = 0; i < dummies; ++i) {
      var dummy = new Skeleton.Bone();
      dummy.name     = rh.readStr();
      dummy.parent   = rh.readUint32();
      dummy.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);

      if (version === 3) {
        dummy.rotation = rh.readBadQuat();
      }

      data.dummies.push(dummy);
    }

    callback(data);
  });
};
