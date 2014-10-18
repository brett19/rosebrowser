'use strict';

function ZoneChunk(data) {
  this.data = data;

  var objectCount = this.data.readUint32();
  var lightmapCount = this.data.readUint32();
  var effectCount = this.data.readUint32();
  var meshanimCount = this.data.readUint32();
  var waterplaneCount = this.data.readUint32();

  this.lightmap = this.data.readUint32();
  this.heights = this.data.readRegion(Float32Array, 4*65*65);
  this.tiles = this.data.readRegion(Uint32Array, 4*16*16);

  this.objects = [];
  for (var i = 0; i < objectCount; ++i) {
    var obj = {
      position: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };
    var modelFlags = this.data.readUint32();
    obj.modelId = modelFlags & 0x7FFFFFFF;
    obj.isDeco = modelFlags & 0x80000000 ? true : false;
    obj.position.x = this.data.readFloat();
    obj.position.y = this.data.readFloat();
    obj.position.z = this.data.readFloat();
    obj.rotation.x = this.data.readFloat();
    obj.rotation.y = this.data.readFloat();
    obj.rotation.z = this.data.readFloat();
    obj.rotation.w = this.data.readFloat();
    obj.scale.x = this.data.readFloat();
    obj.scale.y = this.data.readFloat();
    obj.scale.z = this.data.readFloat();
    obj.partLms = null;
    this.objects.push(obj);
  }

  for (var i = 0; i < lightmapCount; ++i) {
    var partLm = {};
    var objectFlags = this.data.readUint32();
    var objectId = objectFlags & 0x00FFFFFF;
    var partId = objectFlags >> 24;
    partLm.texture = this.data.readUint32();
    var lmFlags = this.data.readUint32();
    partLm.objectNum = lmFlags & 0x0000FFFF;
    partLm.objectsPerAxis = lmFlags >> 16;

    var obj = this.objects[objectId];
    if (!obj) {
      console.warn('Encountered lightmap data that cannot be mapped.');
    }
    if (!obj.partLms) {
      obj.partLms = {};
    }
    obj.partLms[partId] = partLm;
  }

  this.effect = [];
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
    this.effects.push(effect);
  }

  this.meshanims = [];
  for (var i = 0; i < meshanimCount; ++i) {
    var meshanim = {
      position: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };
    meshanim.modelId = this.data.readUint32();
    meshanim.position.x = this.data.readFloat();
    meshanim.position.y = this.data.readFloat();
    meshanim.position.z = this.data.readFloat();
    meshanim.rotation.x = this.data.readFloat();
    meshanim.rotation.y = this.data.readFloat();
    meshanim.rotation.z = this.data.readFloat();
    meshanim.rotation.w = this.data.readFloat();
    meshanim.scale.x = this.data.readFloat();
    meshanim.scale.y = this.data.readFloat();
    meshanim.scale.z = this.data.readFloat();
    this.meshanims.push(meshanim);
  }

  this.waterPlanes = [];
  for (var i = 0; i < waterplaneCount; ++i) {
    var waterPlane = {
      start: new THREE.Vector3(),
      end: new THREE.Vector3()
    };
    waterPlane.start.x = this.data.readFloat();
    waterPlane.start.y = this.data.readFloat();
    waterPlane.start.z = this.data.readFloat();
    waterPlane.end.x = this.data.readFloat();
    waterPlane.end.y = this.data.readFloat();
    waterPlane.end.z = this.data.readFloat();
    this.waterPlanes.push(waterPlane);
  }
}

ZoneChunk.load = function(hashKey, callback) {
  var path = 'cache/zonechunk/' + hashKey.toString(16);
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new ZoneChunk(new RbReader(buffer));
    callback(null, out);
  });
};
