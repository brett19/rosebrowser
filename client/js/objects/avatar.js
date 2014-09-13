'use strict';

var GENDERSKELNAMES = {
  0: 'male_skel',
  1: 'female_skel'
}

function Avatar() {
  this.rootObj = new THREE.Object3D();
  this.skel = null;
}

Avatar.prototype._setSkeleton = function(skelData) {
  this.skel = skelData.create(this.rootObj);
};

Avatar.prototype._setModelPart = function(modelList, partIdx, modelIdx, bindBone) {
  var model = modelList.data.models[modelIdx];

  var self = this;
  for (var j = 0; j < model.parts.length; ++j) {
    (function(part) {
      var material = modelList._createMaterial(part.materialIdx);

      var meshPath = modelList.data.meshes[part.meshIdx];
      Mesh.load(meshPath, function (geometry) {
        if (bindBone === undefined) {
          var charPartMesh = new THREE.SkinnedMesh(geometry, material);
          charPartMesh.bind(self.skel);
          self.rootObj.add(charPartMesh);
        } else {
          var charPartMesh = new THREE.Mesh(geometry, material);
          self.skel.bones[bindBone].add(charPartMesh);
        }
      });
    })(model.parts[j]);
  }
};

Avatar.prototype.setGender = function(genderIdx, callback) {
  var self = this;
  var skelName = GENDERSKELNAMES[genderIdx];
  if (!skelName) {
    throw new Error('Invalid gender specified');
  }
  DM.get(skelName, function(skelData) {
    self._setSkeleton(skelData);
    if (callback) {
      callback();
    }
  });
};

var AVTPARTTYPES = [
  {dataName:'male_hair', boneIdx: 4},
  {dataName:'male_face', boneIdx: 4},
  {dataName:'male_body'},
  {dataName:'male_foot'},
  {dataName:'male_arms'}
];
Avatar.prototype.setModelPart = function(partIdx, modelIdx, callback) {
  var self = this;
  var partType = AVTPARTTYPES[partIdx];
  DM.get(partType.dataName, function(partModelList) {
    self._setModelPart(partModelList, partIdx, modelIdx, partType.boneIdx);
    if (callback) {
      callback();
    }
  });
};
