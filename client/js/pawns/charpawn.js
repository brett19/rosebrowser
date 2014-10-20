var SkelAnimPawn = require('./skelanimpawn');

var GENDERSKELNAMES = {
  0: 'male_skel',
  1: 'female_skel'
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
  SkelAnimPawn.call(this);

  this.gender = -1;
  this.nameTag = null;
  this.modelParts = [];
  this.weaponMotionType = 1;

  if (go) {
    this.owner = go;

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

    this.createNamePlate();
  }
}
CharPawn.prototype = Object.create(SkelAnimPawn.prototype);

CharPawn.prototype.createNamePlate = function() {
  var texture = ui.createNamePlate(this.owner);

  // Recreate the sprite with new texture
  var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
  material.depthWrite = false;
  var sprite = new OrthoSprite(material);
  sprite.position.set(0, 0, 2.0);
  sprite.scale.set(texture.image.width, texture.image.height, 1);
  sprite.offset.set(0, -24, 0);

  this.rootObj.add(sprite);
  this.nameTag = sprite;
};

/**
 * Holds a cache of all loaded animation files data.  This is just the data,
 * and not bound to any particular skeleton.
 *
 * @type {DataCache.<AnimationData>}
 */
CharPawn.motionFileCache = new DataCache(AnimationData);

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

    // Reload items
    for (var i = 0; i < self.modelParts.length; ++i) {
      if (self.modelParts[i]) {
        self.setModelPart(i, self.modelParts[i].id);
      }
    }

    if (callback) {
      callback();
    }
  });
};

CharPawn.prototype._setModelPart = function(modelList, partIdx, modelIdx, bindBone, bindDummy) {
  var self = this;

  // Remove old model
  if (this.modelParts[partIdx]) {
    for (var i = 0; i < this.modelParts[partIdx].meshes.length; ++i) {
      var part = this.modelParts[partIdx].meshes[i];
      part.parent.remove(part);
    }
  }

  this.modelParts[partIdx] = {
    id: modelIdx,
    meshes: []
  };

  // Add new model
  var model = modelList.data.models[modelIdx];

  if (!model) {
    if (modelIdx !== 0) {
      console.warn('Tried to set avatar part to invalid item (' + partIdx + ', ' + modelIdx + ', ' + bindBone + ')');
    }
    return;
  }

  for (var j = 0; j < model.parts.length; ++j) {
    (function(part) {
      var material = modelList._createMaterial(part.materialIdx);
      var meshPath = modelList.data.meshes[part.meshIdx];

      Mesh.load(meshPath, function (geometry) {
        var mesh;

        if (part.boneIndex !== undefined) {
          bindBone = part.boneIndex;
        }

        if (part.dummyIndex !== undefined) {
          bindDummy = part.dummyIndex;
        }

        if (bindBone === undefined && bindDummy === undefined) {
          mesh = new THREE.SkinnedMesh(geometry, material);
          mesh.bind(self.skel);
          self.rootObj.add(mesh);
          self._addBoundsGeometry(mesh);
        } else {
          mesh = new THREE.Mesh(geometry, material);

          if (bindBone !== undefined) {
            self.skel.bones[bindBone].add(mesh);
          } else if (bindDummy !== undefined) {
            self.skel.dummies[bindDummy].add(mesh);
          } else {
            console.warn('Loaded part with no bind location');
          }
        }

        self.modelParts[partIdx].meshes.push(mesh);
      });
    })(model.parts[j]);
  }
};

CharPawn.prototype.setModelPart = function(partIdx, modelIdx, callback) {
  var self = this;
  var partType;
  if (this.gender === 0) {
    partType = MAVTPARTTYPES[partIdx];
  } else {
    partType = FAVTPARTTYPES[partIdx];
  }
  GDM.get(partType.dataName, function(partModelList) {
    self._setModelPart(partModelList, partIdx, modelIdx,
        partType.boneIdx, partType.dummyIdx);
    if (callback) {
      callback();
    }
  });
};

CharPawn.prototype._getMotionData = function(motionFileIdx, callback) {
  GDM.get('char_motions', function(charMotions) {
    this._waitSkeleton(function() {
      var motionRow = charMotions.row(motionFileIdx);
      var motionFile = motionRow[MOTION_TABLE.MALE_MOTION];
      if (this.gender === 1) {
        var femMotionFile = motionRow[MOTION_TABLE.FEMALE_MOTION];
        if (femMotionFile) {
          motionFile = femMotionFile;
        }
      }
      CharPawn.motionFileCache.get(motionFile, callback);
    }.bind(this));
  }.bind(this));
};

CharPawn.prototype.playMotion = function(motionIdx, timeScale, loop, animCallback) {
  var motionTypes = GDM.getNow('char_motiontypes');
  var motionFileIdx = motionTypes.item(motionIdx, this.weaponMotionType);
  SkelAnimPawn.prototype.playMotion.call(this, motionFileIdx, timeScale, loop, animCallback);
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
  this.playMotion(motionIdx, timeScale, 1, function(anim) {
    anim.once('finish', onFinish);
  });
};

CharPawn.prototype.playIdleMotion = function() {
  this.playMotion(AVTANI.STOP1, 1.0, 0);
};

CharPawn.prototype.playRunMotion = function() {
  var timeScale = (this.owner.moveSpeed + 180) / 600;
  this.playMotion(AVTANI.RUN, timeScale, 0);
};

CharPawn.prototype.playSitDownMotion = function(onFinish) {
  this.playMotion(AVTANI.SITTING, 1.0, 1, function(anim) {
    anim.once('finish', onFinish);
  });
};
CharPawn.prototype.playSittingMotion = function() {
  this.playMotion(AVTANI.SIT, 1.0, 0);
};
CharPawn.prototype.playStandUpMotion = function(onFinish) {
  this.playMotion(AVTANI.STANDUP, 1.0, 1, function(anim) {
    anim.once('finish', onFinish);
  });
};

CharPawn.prototype.newDamage = function(amount) {
  DamageRender.add(amount,
      this.rootObj.localToWorld(new THREE.Vector3(0, 0, 2.4)));
};

module.exports = CharPawn;
