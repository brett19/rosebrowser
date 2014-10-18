'use strict';

function SModelDb(data) {
  this.data = data;
  this.modelCount = this.data.readUint32();
  this.modelOffsets = [];
  for (var i = 0; i < this.modelCount; ++i) {
    this.modelOffsets.push(this.data.readUint32());
  }
  this.modelCache = {};
}

SModelDb.prototype.get = function(modelIdx) {
  if (this.modelCache[modelIdx]) {
    return this.modelCache[modelIdx];
  }

  if (modelIdx < 0 || modelIdx >= this.modelOffsets.length) {
    console.warn('Invalid model index.', 0 + ' < ' + modelIdx + ' < ' + this.modelOffsets.length);
    return null;
  }

  var modelOffset = this.modelOffsets[modelIdx];
  if (modelOffset === 0xFFFFFFFF) {
    return null;
  }

  var model = {
    parts: [],
    effects: []
  };
  this.data.seek(modelOffset);

  var partCount = this.data.readUint32();
  var effectCount = this.data.readUint32();

  for (var i = 0; i < partCount; ++i) {
    var part = {
      material: {},
      position: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };

    part.material.texture = this.data.readUint32();
    var matFlags = this.data.readUint32();
    part.material.alphaEnabled = (matFlags & (1 << 0));
    part.material.twoSided = (matFlags & (1 << 1));
    part.material.alphaTest = (matFlags & (1 << 2));
    part.material.depthTest = (matFlags & (1 << 3));
    part.material.depthWrite = (matFlags & (1 << 4));
    part.material.useSpecular = (matFlags & (1 << 5));
    part.material.blendType = this.data.readUint32();
    part.material.alphaRef = this.data.readFloat();
    part.material.opacity = this.data.readFloat();
    part.mesh = this.data.readUint32();
    part.anim = this.data.readUint32();
    part.position.x = this.data.readFloat();
    part.position.y = this.data.readFloat();
    part.position.z = this.data.readFloat();
    part.rotation.x = this.data.readFloat();
    part.rotation.y = this.data.readFloat();
    part.rotation.z = this.data.readFloat();
    part.rotation.w = this.data.readFloat();
    part.scale.x = this.data.readFloat();
    part.scale.y = this.data.readFloat();
    part.scale.z = this.data.readFloat();
    part.parent = this.data.readUint32();
    part.collisionMode = this.data.readUint32();

    model.parts.push(part);
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
    effect.parent = this.data.readUint32();

    model.effects.push(effect);
  }

  this.modelCache[modelIdx] = model;
  return model;
};

SModelDb.load = function(hashKey, callback) {
  var path = 'cache/smodeldb/' + hashKey.toString(16);
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new SModelDb(new RbReader(buffer));
    callback(null, out);
  });
};
