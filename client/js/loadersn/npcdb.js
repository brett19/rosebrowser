'use strict';

function NpcDb(data) {
  this.data = data;
  this.npcCount = this.data.readUint32();
  this.npcOffsets = [];
  for (var i = 0; i < this.npcCount; ++i) {
    this.npcOffsets.push(this.data.readUint32());
  }
  this.npcCache = {};
}

NpcDb.prototype.get = function(npcIdx) {
  if (this.npcCache[npcIdx]) {
    return this.npcCache[npcIdx];
  }

  if (npcIdx < 0 || npcIdx >= this.npcOffsets.length) {
    console.warn('Invalid model index.');
    return null;
  }

  var npcOffset = this.npcOffsets[npcIdx];
  if (npcOffset === 0xFFFFFFFF) {
    return null;
  }

  var npc = {
    animations: [],
    models: [],
    effects: []
  };
  this.data.seek(npcOffset);

  npc.skeleton = this.data.readUint32();
  var animCount = this.data.readUint32();
  var modelCount = this.data.readUint32();
  var effectCount = this.data.readUint32();

  for (var i = 0; i < animCount; ++i) {
    npc.animations.push(this.data.readUint32());
  }

  for (var i = 0; i < modelCount; ++i) {
    npc.models.push(this.data.readUint32());
  }

  for (var i = 0; i < effectCount; ++i) {
    var effect = {
      position: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };

    effect.effect = this.data.readUint32();
    effect.position.x = this.data.readFloat();
    effect.position.y = this.data.readFloat();
    effect.position.z = this.data.readFloat();
    effect.rotation.x = this.data.readFloat();
    effect.rotation.y = this.data.readFloat();
    effect.rotation.z = this.data.readFloat();
    effect.rotation.w = this.data.readFloat();
    effect.scale.x = this.data.readFloat();
    effect.scale.y = this.data.readFloat();
    effect.scale.z = this.data.readFloat();
    effect.dummyIdx = this.data.readUint32();

    npc.effects.push(effect);
  }

  this.npcCache[npcIdx] = npc;
  return npc;
};

NpcDb.load = function(hashKey, callback) {
  var path = 'cache/npcdb/npcs';
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new NpcDb(new RbReader(buffer));
    callback(null, out);
  });
};
