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

Avatar.prototype._setModelPart = function(modelList, partIdx, modelIdx, bindBone, bindDummy) {
  var model = modelList.data.models[modelIdx];
  if (!model) {
    // This is only really a warnable offence if not 0
    if (modelIdx !== 0) {
      console.warn('Tried to set avatar part to invalid item (' + partIdx + ', ' + modelIdx + ', ' + bindBone + ')');
    }
    return;
  }

  var self = this;
  for (var j = 0; j < model.parts.length; ++j) {
    (function(part) {
      var material = modelList._createMaterial(part.materialIdx);

      var meshPath = modelList.data.meshes[part.meshIdx];
      Mesh.load(meshPath, function (geometry) {
        if (part.boneIndex !== undefined) {
          bindBone = part.boneIndex;
        }
        if (part.dummyIndex !== undefined) {
          bindDummy = part.dummyIndex;
        }

        if (bindBone === undefined && bindDummy === undefined) {
          var charPartMesh = new THREE.SkinnedMesh(geometry, material);
          charPartMesh.bind(self.skel);
          self.rootObj.add(charPartMesh);
        } else {
          var charPartMesh = new THREE.Mesh(geometry, material);
          if (bindBone !== undefined) {
            self.skel.bones[bindBone].add(charPartMesh);
          } else if (bindDummy !== undefined) {
            self.skel.dummies[bindDummy].add(charPartMesh);
          } else {
            console.warn('Loaded part with no bind location');
          }
        }
      });
    })(model.parts[j]);
  }
};

Avatar.prototype.setGender = function(genderIdx, callback) {
  var self = this;
  var skelName = GENDERSKELNAMES[genderIdx];
  if (!skelName) {
    throw new Error('Invalid gender specified (' + genderIdx + ')');
  }
  GDM.get(skelName, function(skelData) {
    self._setSkeleton(skelData);
    if (callback) {
      callback();
    }
  });
};

var AVTBODYPART = {
  Face: 0,
  Hair: 1,
  Cap: 2,
  Body: 3,
  Arms: 4,
  Foot: 5,
  FaceItem: 6,
  Back: 7,
  Weapon: 8,
  SubWeapon: 9,
  Max: 10
};

var BoneIndex = {
  Pelvis: 0,
  Head: 4
};
var DummyIndex = {
  RightHand: 0,
  LeftHand: 1,
  LeftHandShield: 2,
  Back: 3,
  Mouse: 4,
  Eyes: 5,
  Cap: 6
};

var MAVTPARTTYPES = [
  { dataName: 'itm_mface', boneIdx: 4 },
  { dataName: 'itm_mhair', boneIdx: 4 },
  { dataName: 'itm_mcap', dummyIdx: DummyIndex.Cap },
  { dataName: 'itm_mbody' },
  { dataName: 'itm_marms' },
  { dataName: 'itm_mfoot' },
  { dataName: 'itm_faceitem', dummyIdx: DummyIndex.Mouse },
  { dataName: 'itm_back', dummyIdx: DummyIndex.Back },
  { dataName: 'itm_weapon' },
  { dataName: 'itm_subwpn' }
];
var FAVTPARTTYPES = [
  { dataName: 'itm_fface', boneIdx: 4 },
  { dataName: 'itm_fhair', boneIdx: 4 },
  { dataName: 'itm_fcap', dummyIdx: DummyIndex.Cap },
  { dataName: 'itm_fbody' },
  { dataName: 'itm_farms' },
  { dataName: 'itm_ffoot' },
  { dataName: 'itm_faceitem', dummyIdx: DummyIndex.Mouse },
  { dataName: 'itm_back', dummyIdx: DummyIndex.Back },
  { dataName: 'itm_weapon' },
  { dataName: 'itm_subwpn' }
];
Avatar.prototype.setModelPart = function(partIdx, modelIdx, callback) {
  var self = this;
  var partType = MAVTPARTTYPES[partIdx];
  GDM.get(partType.dataName, function(partModelList) {
    self._setModelPart(partModelList, partIdx, modelIdx,
        partType.boneIdx, partType.dummyIdx);
    if (callback) {
      callback();
    }
  });
};
