'use strict';

var NPCANI = {
  STOP: 0,
  MOVE: 1,
  ATTACK: 2,
  HIT: 3,
  DIE: 4,
  RUN: 5,
  CACTION1: 6,
  SACTION1: 7,
  CACTION2: 8,
  SACTION2: 9,
  ETC:10,
  MAX: 11
};

function NpcPawn(go) {
  this.rootObj = new THREE.Object3D();
  this.rootObj.owner = this;
  this.charIdx = 0;
  this.skel = null;
  this.skelWaiters = [];
  this.motionCache = null;
  this.activeMotions = [];
  this.defaultMotionIdx = -1;

  if (go) {
    this.owner = go;

    var self = this;
    this.rootObj.name = 'NPC_' + go.serverObjectIdx + '_' + go.charIdx;
    this.rootObj.position.copy(go.position);
    this.rootObj.rotation.z = go.direction;
    this.setModel(go.charIdx);

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
NpcPawn.motionFileCache = new DataCache(AnimationData);

NpcPawn.prototype._setSkeleton = function(skelData) {
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

NpcPawn.prototype._waitSkeleton = function(callback) {
  if (this.skel) {
    callback();
  } else {
    this.skelWaiters.push(callback);
  }
};

NpcPawn.prototype._getMotionData = function(motionIdx, callback) {
  var self = this;
  GDM.get('npc_chars', function(charData) {
    self._waitSkeleton(function() {
      var char = charData.characters[self.charIdx];
      var animIdx = char.animations[motionIdx];
      var motionFile = charData.animations[animIdx];
      NpcPawn.motionFileCache.get(motionFile, function (animData) {
        if (callback) {
          callback(animData);
        }
      });
    });
  });
};

NpcPawn.prototype._getMotion = function(motionIdx, callback) {
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

NpcPawn.prototype._playMotion = function(motionIdx, timeScale, loop, callback) {
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

NpcPawn.prototype.playDefaultMotion = function() {
  var newIdleMotion = NPCANI.STOP;
  if (this.owner) {
    if (this.owner.speed > 0) {
      newIdleMotion = NPCANI.RUN;
    }
  }

  if (newIdleMotion === this.defaultMotionIdx) {
    return;
  }

  this._playMotion(newIdleMotion, 1.0, true);
  this.defaultMotionIdx = newIdleMotion
};

NpcPawn.prototype.playMotion = function(motionIdx, timeScale, loop, callback) {
  this._playMotion(motionIdx, timeScale, loop, callback);
  this.defaultMotionIdx = -1;
};

NpcPawn.prototype.playAttackMotion = function(onFinish) {
  var timeScale = this.owner.stats.getAttackSpeed() / 100;
  this.playMotion(NPCANI.ATTACK, timeScale, false, function(anim) {
    anim.once('finish', onFinish);
  });
};

NpcPawn.prototype._setModel = function(charData, modelMgr, charIdx) {
  var self = this;

  var char = charData.characters[charIdx];
  if (!char) {
    console.warn('Attempted to use npc character which does not exist');
    return false;
  }

  var skelPath = charData.skeletons[char.skeletonIdx];

  SkeletonData.load(skelPath, function(zmdData) {
    self._setSkeleton(zmdData);
    var charSkel = self.skel;

    var charModels = char.models;
    for (var i = 0; i < charModels.length; ++i) {
      var model = modelMgr.data.models[charModels[i]];

      for (var j = 0; j < model.parts.length; ++j) {
        (function(part) {
          if (part.position || part.rotation || part.scale || part.axisRotation) {
            console.warn('NPC Character part has invalid transform data.');
          }
          var material = modelMgr._createMaterial(part.materialIdx);

          var meshPath = modelMgr.data.meshes[part.meshIdx];
          Mesh.load(meshPath, function (geometry) {
            var charPartMesh = new THREE.SkinnedMesh(geometry, material);
            charPartMesh.rootObject = self.rootObj;
            charPartMesh.bind(charSkel);
            self.rootObj.add(charPartMesh);
          });
        })(model.parts[j]);
      }
    }

    for (var e = 0; e < char.effects.length; ++e) {
      var effectPath = charData.effects[char.effects[e].effectIdx];
      var boneIdx = char.effects[e].boneIdx;
      if (boneIdx >= charSkel.dummies.length) {
        console.warn('Attempted to add effect to invalid dummy ', boneIdx, charSkel.bones.length, charSkel.dummies.length);
        continue;
      }

      var effect = EffectManager.loadEffect(effectPath);
      charSkel.dummies[boneIdx].add(effect.rootObj);
      effect.play();
    }
  });
};

NpcPawn.prototype.setModel = function(charIdx, callback) {
  var self = this;
  this.charIdx = charIdx;
  GDM.get('npc_chars', 'npc_models', function(charList, modelList) {
    self._setModel(charList, modelList, charIdx);
    if (callback) {
      callback();
    }
  });

  // TODO: This should be moved away from the Pawn
  GDM.get('list_npc', 'npc_names', function(npcTable, stringTable) {
    var npcRow = npcTable.row(charIdx);
    var strKey = npcRow[40];
    var data = stringTable.getByKey(strKey);
    self.setName(data.text);
    self.setScale(npcRow[4]);
  });
};

NpcPawn.prototype.newDamage = function(amount) {
  DamageRender.add(amount,
      this.rootObj.localToWorld(new THREE.Vector3(0, 0, 2.4)));
};

NpcPawn.prototype.setScale = function(scale) {
  scale = scale * ZZ_SCALE_IN;
  this.rootObj.scale.set(scale, scale, scale);
};

NpcPawn.prototype.setName = function(name) {
  if (this.nameTag) {
    var children = this.nameTag.children.slice();
    for (var i = 0; i < children.length; ++i) {
      this.nameTag.remove(children[i]);
    }
  } else {
    this.nameTag = new THREE.Object3D();
    this.nameTag.position.set(0, 0, 2.0);
    this.rootObj.add(this.nameTag);
  }

  this.name = name;

  var idx = name.indexOf(']');

  if (idx !== -1) {
    var job  = name.substr(0, idx + 1).trim();

    // Create sprite for JOB
    var texture = createTEXTure(Font.FONT.NORMAL_OUTLINE, job);
    var material = new THREE.SpriteMaterial({ map: texture, color: 0xffceae, depthWrite: false });

    var sprite = new OrthoSprite(material);
    sprite.scale.set(texture.image.width, texture.image.height, 1);
    sprite.offset.set(0, -texture.image.height, 0);
    this.nameTag.add(sprite);

    name = name.substr(idx + 1).trim();
  }

  // Create sprite for NAME
  var texture = createTEXTure(Font.FONT.NORMAL_OUTLINE, name);
  var material = new THREE.SpriteMaterial({ map: texture, color: 0xe7ffae, depthWrite: false });

  var sprite = new OrthoSprite(material);
  sprite.scale.set(texture.image.width, texture.image.height, 1);
  this.nameTag.add(sprite);
};

NpcPawn.prototype.update = function(delta) {
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
