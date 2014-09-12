
var ZMSFORMAT = {
  None: 1 << 0,
  Position: 1 << 1,
  Normal: 1 << 2,
  Color: 1 << 3,
  BlendWeight: 1 << 4,
  BlendIndex: 1 << 5,
  Tangent: 1 << 6,
  UV1: 1 << 7,
  UV2: 1 << 8,
  UV3: 1 << 9,
  UV4: 1 << 10
};
var ZMSLoader = {};
ZMSLoader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var geometry = new THREE.Geometry();

    rh.skip(8);
    var format = rh.readUint32();
    rh.readVector3();
    rh.readVector3();

    var boneCount = rh.readUint16();
    var boneTable = [];
    for (var i = 0; i < boneCount; ++i) {
      boneTable[i] = rh.readUint16();
    }

    var vertexCount = rh.readUint16();
    var vertexUvs = [[], [], [], []];

    for (var i = 0; i < vertexCount; ++i) {
      var v = rh.readVector3();
      geometry.vertices.push(v);
    }

    if (format & ZMSFORMAT.Normal) {
      rh.skip(vertexCount * 3*4)
    }
    if (format & ZMSFORMAT.Color) {
      rh.skip(vertexCount * 4*4)
    }
    if (format & (ZMSFORMAT.BlendIndex|ZMSFORMAT.BlendWeight)) {
      for (var i = 0; i < vertexCount; ++i) {
        var boneWeight1 = rh.readFloat();
        var boneWeight2 = rh.readFloat();
        var boneWeight3 = rh.readFloat();
        var boneWeight4 = rh.readFloat();
        var boneIndex1 = boneTable[rh.readUint16()];
        var boneIndex2 = boneTable[rh.readUint16()];
        var boneIndex3 = boneTable[rh.readUint16()];
        var boneIndex4 = boneTable[rh.readUint16()];

        geometry.skinWeights.push(new THREE.Vector4(boneWeight1, boneWeight2, boneWeight3, boneWeight4));
        geometry.skinIndices.push(new THREE.Vector4(boneIndex1, boneIndex2, boneIndex3, boneIndex4));
      }
    }
    if (format & ZMSFORMAT.Tangent) {
      rh.skip(vertexCount * 3*4)
    }
    if (format & ZMSFORMAT.UV1) {
      for (var i = 0; i < vertexCount; ++i) {
        vertexUvs[0].push(rh.readVector2());
      }
    }
    if (format & ZMSFORMAT.UV2) {
      for (var i = 0; i < vertexCount; ++i) {
        vertexUvs[1].push(rh.readVector2());
      }
    }
    if (format & ZMSFORMAT.UV3) {
      for (var i = 0; i < vertexCount; ++i) {
        vertexUvs[2].push(rh.readVector2());
      }
    }
    if (format & ZMSFORMAT.UV4) {
      for (var i = 0; i < vertexCount; ++i) {
        vertexUvs[3].push(rh.readVector2());
      }
    }

    for (var j = 0; j < 4; ++j) {
      if (vertexUvs[j].length > 0) {
        geometry.faceVertexUvs[j] = [];
      }
    }

    var faceCount = rh.readUint16();
    for (var i = 0; i < faceCount; ++i) {
      var v1 = rh.readUint16();
      var v2 = rh.readUint16();
      var v3 = rh.readUint16();
      geometry.faces.push(new THREE.Face3( v1, v2, v3 ));

      for (var j = 0; j < 4; ++j) {
        if (vertexUvs[j].length > 0) {
          geometry.faceVertexUvs[j].push([vertexUvs[j][v1], vertexUvs[j][v2], vertexUvs[j][v3]]);
        }
      }
    }

    //geometry.mergeVertices();
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    callback(geometry);
  });
};
