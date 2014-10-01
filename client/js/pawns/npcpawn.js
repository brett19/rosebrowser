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
  this.skel = null;
  this.charIdx = 0;
  this.motionCache = new IndexedCache(this._loadMotion.bind(this));
  this.activeMotionIdx = NPCANI.STOP;
  this.activeMotion = null;
  this.prevMotion = null;

  if (go) {
    this.owner = go;

    var self = this;
    this.rootObj.name = 'NPC_' + go.serverObjectIdx + '_' + go.charIdx;
    this.rootObj.rotation.z = go.direction;
    this.setModel(go.charIdx);

    go.on('start_move', function() {
      self.setMotion(NPCANI.MOVE);
    });
    go.on('stop_move', function() {
      self.setMotion(NPCANI.STOP);
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
 * @type {DataCache.<AnimationData>}
 */
NpcPawn.motionFileCache = new DataCache(AnimationData);

// This function should never be called directly, and should only used
//   by the loadedMotions cache.  Use this.motionCache.get instead.
NpcPawn.prototype._loadMotion = function(actionIdx, callback) {
  var self = this;
  GDM.get('npc_chars', function(charData) {
    var char = charData.characters[self.charIdx];
    var animIdx = char.animations[actionIdx];
    var motionFile = charData.animations[animIdx];

    NpcPawn.motionFileCache.get(motionFile, function(animData) {
      var anim = new SkeletonAnimator(self.skel, animData);
      callback(anim);
    });
  });
};

NpcPawn.prototype.setMotion = function(actionIdx, callback) {
  this.activeMotionIdx = actionIdx;

  // If the skeleton isn't loaded yet, just do nothing and the skeleton
  //  loader will set it later.
  if (!this.skel) {
    return;
  }

  var self = this;
  this.motionCache.get(actionIdx, function(anim) {
    // Don't overwrite any newer motion changes.
    if (actionIdx !== self.activeMotionIdx) {
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

    if (callback) {
      callback();
    }
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
    var charSkel = zmdData.create(self.rootObj);
    self.skel = charSkel;

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

    self.setMotion(self.activeMotionIdx);

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
  });
};

NpcPawn.prototype.newDamage = function(amount) {
  DamageRender.add(amount,
      this.rootObj.localToWorld(new THREE.Vector3(0, 0, 2.4)));
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
