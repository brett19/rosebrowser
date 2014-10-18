'use strict';

function MModelDb(data) {
  this.data = data;
  this.modelCount = this.data.readUint32();
  this.modelOffsets = [];
  for (var i = 0; i < this.modelCount; ++i) {
    this.modelOffsets.push(this.data.readUint32());
  }
  this.modelCache = {};
}

MModelDb.prototype.get = function(modelIdx) {
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
    material: {}
  };
  this.data.seek(modelOffset);

  model.material.texture = this.data.readUint32();
  var matFlags = this.data.readUint32();
  model.material.alphaEnabled = (matFlags & (1 << 0));
  model.material.twoSided = (matFlags & (1 << 1));
  model.material.alphaTest = (matFlags & (1 << 2));
  model.material.depthTest = (matFlags & (1 << 3));
  model.material.depthWrite = (matFlags & (1 << 4));
  model.material.blendOp = (matFlags >> 5) & 0x3F;
  model.material.blendSrc = (matFlags >> 11) & 0x3F;
  model.material.blendDest = (matFlags >> 17) & 0x3F;
  model.mesh = this.data.readUint32();
  model.anim = this.data.readUint32();

  this.modelCache[modelIdx] = model;
  return model;
};

MModelDb.load = function(hashKey, callback) {
  var path = 'cache/mmodeldb/' + hashKey.toString(16);
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new MModelDb(new RbReader(buffer));
    callback(null, out);
  });
};
