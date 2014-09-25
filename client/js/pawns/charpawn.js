'use strict';

var GENDERSKELNAMES = {
  0: 'male_skel',
  1: 'female_skel'
};

var MOTION_TABLE = {
  MALE_MOTION: 0, // STR
  FEMALE_MOTION: 1, // STR
  MOTION_TYPE: 2, // INT
  DESCRIPTION: 3 // STR
};

var AVTANI = {
  STOP1: 0,
  STOP2: 1,
  WALK: 2,
  RUN: 3,
  SITTING: 4,
  SIT: 5,
  STANDUP: 6,
  STOP3: 7,
  ATTACK: 8,
  ATTACK2: 9,
  ATTACK3: 10,
  HIT: 11,
  FALL: 12,
  DIE: 13,
  RAISE: 14,
  JUMP1: 15,
  JUMP2: 16,
  PICKITEM: 17
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

var AVTRIDEPART = {
  Max: 5
};

var AVTSHOTTYPE = {
  Max: 3
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
  { dataName: 'itm_mfaceitem', dummyIdx: DummyIndex.Mouse },
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
  { dataName: 'itm_ffaceitem', dummyIdx: DummyIndex.Mouse },
  { dataName: 'itm_back', dummyIdx: DummyIndex.Back },
  { dataName: 'itm_weapon' },
  { dataName: 'itm_subwpn' }
];

/**
 * @constructor
 *
 * Holds a cache of all animations that are actually loaded against
 * this skeleton and can be used immediately (and should not be loaded
 * against the skeleton again).
 * @property {IndexedCache.<THREE.Animation>} motionCache
 */
function CharPawn(go) {
  this.rootObj = new THREE.Object3D();
  this.rootObj.owner = this;
  this.skel = null;
  this.gender = 0;
  this.motionCache = null;
  this.activeMotionIdx = -1;
  this.activeMotion = null;
  this.prevMotion = null;

  if (go) {
    this.owner = go;

    var self = this;
    this.rootObj.name = 'CHAR_' + '????';
    this.setGender(go.gender, function() {
      for (var j = 0; j < AVTBODYPART.Max; ++j) {
        self.setModelPart(j, go.visParts[j].itemNo);
      }
    });

    go.on('start_move', function() {
      self.setMotion(AVTANI.RUN);
    });
    go.on('stop_move', function() {
      self.setMotion(AVTANI.STOP1);
    });
    go.on('moved', function () {
      self.rootObj.position.copy(go.position);
      self.rootObj.rotation.z = go.direction;
    });
  }
}

/**
 * Holds a cache of all loaded animation files data.  This is just the data,
 * and not bound to any particular skeleton.
 *
 * @type {DataCache.<Animation>}
 */
CharPawn.motionFileCache = new DataCache(Animation);

// This function should never be called directly, and should only used
//   by the loadedMotions cache.  Use this.motionCache.get instead.
CharPawn.prototype._loadMotion = function(motionFileIdx, callback) {
  var self = this;
  GDM.get('char_motions', function(motionTable) {
    var motionRow = motionTable.row(motionFileIdx);
    var motionFile = motionRow[MOTION_TABLE.MALE_MOTION + self.gender];

    CharPawn.motionFileCache.get(motionFile, function(animData) {
      var anim = animData.createForSkeleton(motionFile, self.rootObj, self.skel);
      callback(anim);
    });
  });
};

CharPawn.prototype._setSkeleton = function(skelData) {
  this.skel = skelData.create(this.rootObj);

  // Reset the loaded motions if the skeleton changed...
  this.motionCache = new IndexedCache(this._loadMotion.bind(this));

  this.setMotion(AVTANI.STOP1);
};

CharPawn.prototype._setModelPart = function(modelList, partIdx, modelIdx, bindBone, bindDummy) {
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
          charPartMesh.rootObject = self.rootObj;
          charPartMesh.bind(self.skel);
          self.rootObj.add(charPartMesh);
        } else {
          var charPartMesh = new THREE.Mesh(geometry, material);
          charPartMesh.rootObject = self.rootObj;
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

CharPawn.prototype.setGender = function(genderIdx, callback) {
  var self = this;
  this.gender = genderIdx;

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

CharPawn.prototype.setMotion = function(motionIdx, callback) {
  this.activeMotionIdx = motionIdx;

  var self = this;
  GDM.get('char_motiontypes', function(motionTypes) {

    var motionFileIdx = motionTypes.item(motionIdx, 1);

    self.motionCache.get(motionFileIdx, function(anim) {
      // Don't overwrite any newer motion changes.
      if (motionIdx !== self.activeMotionIdx) {
        return;
      }

      if (self.activeMotion === anim) {
        // Already playing this animation!
        return;
      }

      self.prevMotion = self.activeMotion;

      self.activeMotion = anim;

      // TODO: Accessing owner like this is unsafe for non-GO based pawns.
      if (self.owner) {
        var moveAnimScale = (self.owner.moveSpeed + 180) / 600;
        anim.timeScale = moveAnimScale;
      }

      anim.play();
      if (self.prevMotion) {
        self.activeMotion.weight = 1 - self.prevMotion.weight;
      } else {
        self.activeMotion.weight = 1;
      }
    });
  });
};

CharPawn.prototype.setModelPart = function(partIdx, modelIdx, callback) {
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

CharPawn.prototype.update = function(delta) {
  var blendWeightDelta = 6 * delta;

  if (this.prevMotion && this.activeMotion) {
    this.prevMotion.weight -= blendWeightDelta;
    this.activeMotion.weight += blendWeightDelta;

    if (this.activeMotion.weight >= 1.0) {
      this.activeMotion.weight = 1.0;
      this.prevMotion.stop();
      this.prevMotion = null;
    }
  }
};
