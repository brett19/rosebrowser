var SkelAnimPawn = require('./skelanimpawn');

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
  SkelAnimPawn.call(this);

  this.charIdx = 0;

  if (go) {
    this.owner = go;

    var self = this;
    this.rootObj.name = 'NPC_' + go.serverObjectIdx + '_' + go.charIdx;
    this.rootObj.position.copy(go.position);
    this.rootObj.rotation.z = go.direction;

    go.on('damage', function(amount) {
      self.newDamage(amount);
    });
  }
}
NpcPawn.prototype = Object.create(SkelAnimPawn.prototype);

NpcPawn.prototype.createNamePlate = function() {
  var texture = ui.createNamePlate(this.owner);

  // Use STB height if available
  var npcHeight = this.owner.stats.getHeight();

  if (npcHeight === 0) {
    npcHeight = this.boundingBox.max.z - this.boundingBox.min.z;
  }

  // Recreate the sprite with new texture
  var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
  material.depthWrite = false;
  var sprite = new OrthoSprite(material);
  sprite.position.set(0, 0, npcHeight);
  sprite.scale.set(texture.image.width, texture.image.height, 1);
  sprite.offset.set(0, -48, 0);

  this.rootObj.add(sprite);
  this.nameTag = sprite;
};

/**
 * Holds a cache of all loaded animation files data.  This is just the data,
 * and not bound to any particular skeleton.
 *
 * @type {DataCache.<AnimationData>}
 */
NpcPawn.motionFileCache = new DataCache(AnimationData);

NpcPawn.prototype._getMotionData = function(motionIdx, callback) {
  GDM.get('npc_chars', function(charData) {
    var char = charData.characters[this.charIdx];
    var animIdx = char.animations[motionIdx];
    var motionFile = charData.animations[animIdx];
    NpcPawn.motionFileCache.get(motionFile, callback);
  }.bind(this));
};

NpcPawn.prototype.playAttackMotion = function(onFinish) {
  var timeScale = this.owner.stats.getAttackSpeed() / 100;
  this.playMotion(NPCANI.ATTACK, timeScale, 1, function(anim) {
    anim.once('finish', onFinish);
  });
};

NpcPawn.prototype.playRunMotion = function() {
  this.playMotion(NPCANI.RUN, 1.0, 0);
};

NpcPawn.prototype.playIdleMotion = function() {
  this.playMotion(NPCANI.STOP, 1.0, 0);
};

NpcPawn.prototype._addEffectToBone = function(boneIdx, effectPath, callback) {
  if (boneIdx >= this.skel.dummies.length) {
    console.warn('Attempted to add effect to invalid dummy ', boneIdx, this.skel.bones.length, this.skel.dummies.length);
    return;
  }

  EffectManager.loadEffect(effectPath, function(effect) {
    if (effect) {
      this.skel.dummies[boneIdx].add(effect.rootObj);
      effect.play();
    }
  }.bind(this));
};

NpcPawn.prototype._setModel = function(charData, modelMgr, charIdx) {
  var self = this;

  var char = charData.characters[charIdx];
  if (!char) {
    console.warn('Attempted to use npc character which does not exist');
    return false;
  }

  var skelPath = charData.skeletons[char.skeletonIdx];
  var waitAll = new MultiWait();
  var waitSkeleton = waitAll.one();

  SkeletonData.load(skelPath, function(zmdData) {
    self._setSkeleton(zmdData);
    var charSkel = self.skel;

    var charModels = char.models;
    for (var i = 0; i < charModels.length; ++i) {
      var model = modelMgr.data.models[charModels[i]];

      for (var j = 0; j < model.parts.length; ++j) {
        (function(part, waitPart) {
          if (part.position || part.rotation || part.scale || part.axisRotation) {
            console.warn('NPC Character part has invalid transform data.');
          }
          var material = modelMgr._createMaterial(part.materialIdx);

          var meshPath = modelMgr.data.meshes[part.meshIdx];
          Mesh.load(meshPath, function (geometry) {
            var charPartMesh = new THREE.SkinnedMesh(geometry, material);
            charPartMesh.bind(charSkel);
            self.rootObj.add(charPartMesh);
            self._addBoundsGeometry(charPartMesh);
            waitPart();
          });
        })(model.parts[j], waitAll.one());
      }
    }

    for (var e = 0; e < char.effects.length; ++e) {
      var effectPath = charData.effects[char.effects[e].effectIdx];
      var boneIdx = char.effects[e].boneIdx;
      self._addEffectToBone(boneIdx, effectPath);
    }

    waitSkeleton();
  });

  waitAll.wait(function(){
    self.createNamePlate();
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
};

NpcPawn.prototype.newDamage = function(amount) {
  DamageRender.add(amount,
      this.rootObj.localToWorld(new THREE.Vector3(0, 0, 2.4)));
};

NpcPawn.prototype.setScale = function(scale) {
  scale = scale * ZZ_SCALE_IN;
  this.rootObj.scale.set(scale, scale, scale);
};

module.exports = NpcPawn;
