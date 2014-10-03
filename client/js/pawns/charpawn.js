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
 * @property {Object.<string,SkeletonAnimator>} motionCache
 * Holds a cache of all animations that are actually loaded against
 * this skeleton and can be used immediately (and should not be loaded
 * against the skeleton again).
 */
function CharPawn(go) {
  this.rootObj = new THREE.Object3D();
  this.rootObj.owner = this;
  this.gender = -1;
  this.skel = null;
  this.skelWaiters = [];
  this.motionCache = null;
  this.activeMotions = [];
  this.defaultMotionIdx = -1;
  this.nameTag = null;

  if (go) {
    this.owner = go;
    this.setName(go.name);

    var self = this;
    this.rootObj.name = 'CHAR_' + '????';
    this.setGender(go.gender, function() {
      for (var j = 0; j < AVTBODYPART.Max; ++j) {
        self.setModelPart(j, go.visParts[j].itemNo);
      }
    });

    go.on('damage', function(amount) {
      self.newDamage(amount);
    });
  }

  this.playDefaultMotion();
}

/**
 * Holds a cache of all loaded animation files data.  This is just the data,
 * and not bound to any particular skeleton.
 *
 * @type {DataCache.<AnimationData>}
 */
CharPawn.motionFileCache = new DataCache(AnimationData);

CharPawn.prototype._setSkeleton = function(skelData) {
  this.skel = skelData.create(this.rootObj);

  // Reset the loaded motions if the skeleton changed...
  this.motionCache = {};
  this.activeMotions = [];

  // Let everyone waiting know!
  for (var i = 0; i < this.skelWaiters.length; ++i) {
    this.skelWaiters[i]();
  }
  this.skelWaiters = [];
};

CharPawn.prototype._waitSkeleton = function(callback) {
  if (this.gender !== 0 && this.gender !== 1) {
    throw new Error('Cannot wait on a skeleton that is not loading.');
  }

  if (this.skel) {
    callback();
  } else {
    this.skelWaiters.push(callback);
  }
};

CharPawn.prototype.setGender = function(genderIdx, callback) {
  // Dont waste time doing nothing
  if (this.gender === genderIdx) {
    return;
  }

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

CharPawn.prototype._getMotionData = function(motionIdx, callback) {
  GDM.get('char_motiontypes', 'char_motions', function(motionTypes, charMotions) {
    this._waitSkeleton(function() {
      var motionFileIdx = motionTypes.item(motionIdx, 1);
      var motionRow = charMotions.row(motionFileIdx);
      var motionFile = motionRow[MOTION_TABLE.MALE_MOTION + this.gender];
      CharPawn.motionFileCache.get(motionFile, function (animData) {
        if (callback) {
          callback(animData);
        }
      });
    }.bind(this));
  }.bind(this));
};

CharPawn.prototype._getMotion = function(motionIdx, callback) {
  // We check the cache after the getMotionData to avoid synchronization
  //   issues from calling this method twice in a row for the same motion.
  this._getMotionData(motionIdx, function(animData) {
    if (this.motionCache[motionIdx]) {
      callback(this.motionCache[motionIdx]);
      return;
    }
    var anim = new SkeletonAnimator(this.skel, animData);
    this.motionCache[motionIdx] = anim;
    callback(anim);
  }.bind(this));
};

CharPawn.prototype._playMotion = function(motionIdx, timeScale, loop, callback) {
  this._getMotion(motionIdx, function(anim) {
    var activeIdx = this.activeMotions.indexOf(anim);
    if (activeIdx !== -1) {
      this.activeMotions.splice(activeIdx, 1);
    }

    anim.timeScale = timeScale;
    anim.loop = loop;
    if (!anim.isPlaying) {
      anim.play(0, 0);
    }

    // If no motions were previously playing, immediately activate this one.
    if (this.activeMotions.length === 0) {
      anim.weight = 1;
    }

    this.activeMotions.unshift(anim);

    if (callback) {
      callback(anim);
    }
  }.bind(this));
};

CharPawn.prototype.playDefaultMotion = function() {
  var timeScale = 1.0;
  var newIdleMotion = AVTANI.STOP1;
  if (this.owner) {
    if (this.owner.isSitting) {
      newIdleMotion = AVTANI.SITTING;
    } else if (this.owner.speed > 0) {
      if (this.owner.isRunning) {
        timeScale = (this.owner.moveSpeed + 180) / 600;
        newIdleMotion = AVTANI.RUN;
      } else {
        newIdleMotion = AVTANI.WALK;
      }
    }
  }

  if (newIdleMotion === this.defaultMotionIdx) {
    return;
  }

  this._playMotion(newIdleMotion, timeScale, true);
  this.defaultMotionIdx = newIdleMotion
};

CharPawn.prototype.playMotion = function(motionIdx, timeScale, loop, callback) {
  this._playMotion(motionIdx, timeScale, loop, callback);
  this.defaultMotionIdx = -1;
};

CharPawn.prototype.playAttackMotion = function(onFinish) {
  var timeScale = this.owner.stats.getAttackSpeed() / 100;
  var motionIdx = AVTANI.ATTACK;
  var animNum = Math.floor(Math.random() * 3);
  if (animNum === 1) {
    motionIdx = AVTANI.ATTACK2;
  } else if (animNum === 2) {
    motionIdx = AVTANI.ATTACK3;
  }
  this.playMotion(motionIdx, timeScale, false, function(anim) {
    anim.once('finish', onFinish);
  });
};

CharPawn.prototype.newDamage = function(amount) {
  DamageRender.add(amount,
      this.rootObj.localToWorld(new THREE.Vector3(0, 0, 2.4)));
};

CharPawn.prototype.setName = function(name) {
  this.name = name;

  var texture = createTEXTure(Font.FONT.NORMAL_OUTLINE, name);

  // Recreate the sprite with new texture
  var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
  material.depthWrite = false;
  var sprite = new OrthoSprite(material);
  sprite.position.set(0, 0, 2.0);
  sprite.scale.set(texture.image.width, texture.image.height, 1);
  sprite.offset.set(0, 0, 0);

  if (this.nameTag) {
    this.rootObj.remove(this.nameTag);
  }

  this.rootObj.add(sprite);
  this.nameTag = sprite;
};

CharPawn.prototype.update = function(delta) {
  // Update Animation Blending
  var blendWeightDelta = 6 * delta;
  if (this.activeMotions.length >= 1) {
    var activeMotion = this.activeMotions[0];
    if (activeMotion.weight < 1) {
      activeMotion.weight += blendWeightDelta;
    }

    for (var i = 1; i < this.activeMotions.length; ++i) {
      var motion = this.activeMotions[i];
      motion.weight -= blendWeightDelta;
      if (!motion.isPlaying || motion.weight <= 0) {
        motion.stop();
        this.activeMotions.splice(i, 1);
        --i;
      }
    }

    if (!this.activeMotions[0].isPlaying) {
      this.playDefaultMotion();
    }
  }

  // Update stuff
  if (this.owner) {
    var self = this;
    var dirStep = (Math.PI * 3) * delta;
    var deltaDir = slerp1d(this.owner.direction, self.rootObj.rotation.z);

    if (deltaDir > dirStep || deltaDir < -dirStep) {
      if (deltaDir < 0) {
        self.rootObj.rotation.z -= dirStep;
      } else {
        self.rootObj.rotation.z += dirStep;
      }
    } else {
      self.rootObj.rotation.z = this.owner.direction;
    }

    self.rootObj.position.copy(this.owner.position);
  }

  if (this.defaultMotionIdx !== -1) {
    this.playDefaultMotion();
  }
};
