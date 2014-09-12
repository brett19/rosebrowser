var ZMDLoader = {};

function ZMDSkeleton() {
  this.bones = [];
  this.dummies = [];
}
/**
 * Creates a skeleton object from this skeleton data.
 */
ZMDSkeleton.prototype.create = function(rootObj) {
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

ZMDLoader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var skel = new ZMDSkeleton();

    rh.skip(7);

    var boneCount = rh.readUint32();
    for (var i = 0; i < boneCount; ++i) {
      var bone = {};
      bone.parent = rh.readUint32();
      bone.name = rh.readStr();
      bone.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
      bone.rotation = rh.readBadQuat();

      if (i == 0) {
        bone.parent = -1;
      }

      skel.bones.push(bone);
    }

    //var dummyCount = rh.readUint32();

    callback(skel);
  });
};
