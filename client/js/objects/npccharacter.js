'use strict';

function NpcCharacter() {
  this.rootObj = new THREE.Object3D();
}

NpcCharacter.prototype._setModel = function(charData, modelMgr, charIdx) {
  var self = this;

  var char = charData.characters[charIdx];
  if (!char) {
    console.warn('Attempted to use npc character which does not exist');
    return false;
  }

  var skelPath = charData.skeletons[char.skeletonIdx];

  Skeleton.load(skelPath, function(zmdData) {
    var charSkel = zmdData.create(self.rootObj);

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
            charPartMesh.bind(charSkel);
            self.rootObj.add(charPartMesh);
          });
        })(model.parts[j]);
      }
    }

    var animPath = charData.animations[char.animations[0]];
    Animation.load(animPath, function(zmoData) {
      var anim = zmoData.createForSkeleton('test', self.rootObj, charSkel);
      anim.play();
    });
  });
};

NpcCharacter.prototype.setModel = function(charIdx, callback) {
  var self = this;
  GDM.get('npc_chars', 'npc_models', function(charList, modelList) {
    self._setModel(charList, modelList, charIdx);
    if (callback) {
      callback();
    }
  });
};

NpcCharacter.prototype.update = function(delta) {

};
