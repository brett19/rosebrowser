'use strict';

function PModelDb(data) {
  this.data = data;
  this.modelCount = this.data.readUint32();
  this.modelOffsets = [];
  for (var i = 0; i < this.modelCount; ++i) {
    this.modelOffsets.push(this.data.readUint32());
  }
  this.modelCache = {};
}

PModelDb.prototype.get = function(modelIdx) {
  if (this.modelCache[modelIdx]) {
    return this.modelCache[modelIdx];
  }

  if (modelIdx < 0 || modelIdx >= this.modelOffsets.length) {
    console.warn('Invalid model index.');
    return null;
  }

  var modelOffset = this.modelOffsets[modelIdx];
  if (modelOffset === 0xFFFFFFFF) {
    return null;
  }

  var model = {
    parts: []
  };
  this.data.seek(modelOffset);

  var partCount = this.data.readUint32();

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
    var attachFlags = this.data.readUint32();
    part.attachType = attachFlags & 0x00000003;
    part.attachIndex = attachFlags >> 2;

    model.parts.push(part);
  }

  this.modelCache[modelIdx] = model;
  return model;
};

PModelDb.load = function(hashKey, callback) {
  var path = 'cache/pmodeldb/' + hashKey.toString(16);
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new PModelDb(new RbReader(buffer));
    callback(null, out);
  });
};
