'use strict';

function NMesh() {
}

NMesh.AttributeType = {
  Positions: 1,
  UVs1: 2,
  UVs2: 3,
  UVs3: 4,
  UVs4: 5,
  SkinWeights: 6,
  SkinIndices: 7,
  Indices: 8
};

NMesh._build = function(rh, callback) {
  var geometry = new THREE.BufferGeometry();

  var attribCount = rh.readUint32();
  for (var i = 0; i < attribCount; ++i) {
    var type = rh.readUint32();
    var offset = rh.readUint32();
    var length = rh.readUint32();
    if (type === NMesh.AttributeType.Indices) {
      geometry.addAttribute('index', new THREE.BufferAttribute(
          rh.getRegion(Uint16Array, offset, length), 3));
    } else if (type === NMesh.AttributeType.Positions) {
      geometry.addAttribute('position', new THREE.BufferAttribute(
          rh.getRegion(Float32Array, offset, length), 3));
    } else if (type === NMesh.AttributeType.SkinWeights) {
      geometry.addAttribute('skinWeight', new THREE.BufferAttribute(
          rh.getRegion(Float32Array, offset, length), 4));
    } else if (type === NMesh.AttributeType.SkinIndices) {
      geometry.addAttribute('skinIndex', new THREE.BufferAttribute(
          rh.getRegion(Float32Array, offset, length), 4));
    } else if (type === NMesh.AttributeType.UVs1) {
      geometry.addAttribute('uv', new THREE.BufferAttribute(
          rh.getRegion(Float32Array, offset, length), 2));
    } else if (type === NMesh.AttributeType.UVs2) {
      geometry.addAttribute('uv2', new THREE.BufferAttribute(
          rh.getRegion(Float32Array, offset, length), 2));
    } else {
      console.warn('Encountered mesh with an invalid attribute type.');
    }
  }

  geometry.dynamic = false;
  geometry.computeBoundingSphere();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  callback(null, geometry);
};

NMesh._cache = new IndexedCache(function(hashKey, callback) {
  var path = 'cache/mesh/' + hashKey.toString(16);

  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    NMesh._build(new RbReader(buffer), function(err, data) {
      if (err) {
        return callback(null);
      }
      callback(data);
    });
  });
});

NMesh._cached = {};

NMesh.load = function(hashKey, callback) {
  NMesh._cache.get(hashKey, function(data) {
    callback(null, data);
  });
};
