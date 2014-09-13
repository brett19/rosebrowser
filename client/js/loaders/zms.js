/**
 * @constructor
 * @property {RangeVector3} bounds
 * @property {THREE.Vector3[]} vertices
 * @property {THREE.Vector3[]} normals
 * @property {THREE.Vector3[]} tangents
 * @property {Colour3[]} colours
 * @property {THREE.Face3[]} faces
 * @property {{weights: THREE.Vector4[], indices: THREE.Vector4[]}} skin
 * @property {THREE.Vector2[][]} uv
 */
var Mesh = function() {
  this.bounds = {};
  this.vertices = [];
  this.normals = [];
  this.tangents = [];
  this.colours = [];
  this.faces = [];
  this.skin = {
    weights: [],
    indices: []
  };
  this.uv = [
    [], [], [], []
  ];
};


/**
 * Mesh format flags
 *
 * @enum {Number}
 */
Mesh.FORMAT = {
  NONE:         1 << 0,
  POSITION:     1 << 1,
  NORMAL:       1 << 2,
  COLOUR:       1 << 3,
  BLEND_WEIGHT: 1 << 4,
  BLEND_INDEX:  1 << 5,
  TANGENT:      1 << 6,
  UV1:          1 << 7,
  UV2:          1 << 8,
  UV3:          1 << 9,
  UV4:          1 << 10
};


/**
 * @param {BinaryReader} rh
 * @returns {Mesh}
 */
Mesh.loadMesh8 = function(rh) {
  var bones, boneTable, faces, format, i, vertices;
  var data = new Mesh();

  format = rh.readUint32();
  data.bounds.min = rh.readVector3();
  data.bounds.max = rh.readVector3();

  bones = rh.readUint16();
  boneTable = [];
  for (i = 0; i < bones; ++i) {
    boneTable.push(rh.readUint16());
  }

  vertices = rh.readUint16();
  for (i = 0; i < vertices; ++i) {
    data.vertices.push(rh.readVector3());
  }

  if (format & Mesh.FORMAT.NORMAL) {
    for (i = 0; i < vertices; ++i) {
      data.normals.push(rh.readVector3());
    }
  }

  if (format & Mesh.FORMAT.COLOUR) {
    for (i = 0; i < vertices; ++i) {
      data.colours.push(rh.readColour4());
    }
  }

  if (format & (Mesh.FORMAT.BLEND_INDEX | Mesh.FORMAT.BLEND_WEIGHT)) {
    for (i = 0; i < vertices; ++i) {
      var weight1 = rh.readFloat();
      var weight2 = rh.readFloat();
      var weight3 = rh.readFloat();
      var weight4 = rh.readFloat();
      var index1 = boneTable[rh.readUint16()];
      var index2 = boneTable[rh.readUint16()];
      var index3 = boneTable[rh.readUint16()];
      var index4 = boneTable[rh.readUint16()];

      data.skin.weights.push(new THREE.Vector4(weight1, weight2, weight3, weight4));
      data.skin.indices.push(new THREE.Vector4(index1, index2, index3, index4));
    }
  }

  if (format & Mesh.FORMAT.TANGENT) {
    for (i = 0; i < vertices; ++i) {
      data.tangents.push(rh.readVector3());
    }
  }

  if (format & Mesh.FORMAT.UV1) {
    for (i = 0; i < vertices; ++i) {
      data.uv[0].push(rh.readVector2());
    }
  }

  if (format & Mesh.FORMAT.UV2) {
    for (i = 0; i < vertices; ++i) {
      data.uv[1].push(rh.readVector2());
    }
  }
  if (format & Mesh.FORMAT.UV3) {
    for (i = 0; i < vertices; ++i) {
      data.uv[2].push(rh.readVector2());
    }
  }

  if (format & Mesh.FORMAT.UV4) {
    for (i = 0; i < vertices; ++i) {
      data.uv[3].push(rh.readVector2());
    }
  }

  faces = rh.readUint16();
  for (i = 0; i < faces; ++i) {
    var v1 = rh.readUint16();
    var v2 = rh.readUint16();
    var v3 = rh.readUint16();
    data.faces.push(new THREE.Face3(v1, v2, v3));
  }

  return data;
};


/**
 * @param {BinaryReader} rh
 * @returns {Mesh}
 */
Mesh.loadMesh6 = function(rh) {
  var bones, boneTable, faces, format, i, vertices;
  var data = new Mesh();

  format = rh.readUint32();
  data.bounds.min = rh.readVector3();
  data.bounds.max = rh.readVector3();

  bones = rh.readUint32();
  boneTable = [];
  for (i = 0; i < bones; ++i) {
    rh.skip(4);
    boneTable.push(rh.readUint32());
  }

  vertices = rh.readUint32();
  for (i = 0; i < vertices; ++i) {
    rh.skip(4);
    data.vertices.push(rh.readVector3());
  }

  if (format & Mesh.FORMAT.NORMAL) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.normals.push(rh.readVector3());
    }
  }

  if (format & Mesh.FORMAT.COLOUR) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.colours.push(rh.readColour4());
    }
  }

  if (format & (Mesh.FORMAT.BLEND_INDEX | Mesh.FORMAT.BLEND_WEIGHT)) {
    for (i = 0; i < vertices; ++i) {
      var weight1, weight2, weight3, weight4;
      var index1, index2, index3, index4;

      rh.skip(4);
      weight1 = rh.readFloat();
      weight2 = rh.readFloat();
      weight3 = rh.readFloat();
      weight4 = rh.readFloat();
      index1 = boneTable[rh.readUint32()];
      index2 = boneTable[rh.readUint32()];
      index3 = boneTable[rh.readUint32()];
      index4 = boneTable[rh.readUint32()];

      data.skin.weights.push(new THREE.Vector4(weight1, weight2, weight3, weight4));
      data.skin.indices.push(new THREE.Vector4(index1, index2, index3, index4));
    }
  }

  if (format & Mesh.FORMAT.TANGENT) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.tangents.push(rh.readVector3());
    }
  }

  if (format & Mesh.FORMAT.UV1) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.uv[0].push(rh.readVector2());
    }
  }

  if (format & Mesh.FORMAT.UV2) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.uv[1].push(rh.readVector2());
    }
  }
  if (format & Mesh.FORMAT.UV3) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.uv[2].push(rh.readVector2());
    }
  }

  if (format & Mesh.FORMAT.UV4) {
    for (i = 0; i < vertices; ++i) {
      rh.skip(4);
      data.uv[3].push(rh.readVector2());
    }
  }

  faces = rh.readUint32();
  for (i = 0; i < faces; ++i) {
    var v1, v2, v3;
    rh.skip(4);
    v1 = rh.readUint32();
    v2 = rh.readUint32();
    v3 = rh.readUint32();
    data.faces.push(new THREE.Face3(v1, v2, v3));
  }

  return data;
};


/**
 * @returns {THREE.Geometry}
 */
Mesh.prototype.create = function() {
  var geometry, i, j;
  geometry = new THREE.Geometry();
  geometry.vertices = this.vertices;
  geometry.skinWeights = this.skin.weights;
  geometry.skinIndices = this.skin.indices;
  geometry.faces = this.faces;

  for (j = 0; j < 4; ++j) {
    if (this.uv[j].length > 0) {
      geometry.faceVertexUvs[j] = [];
    }
  }

  for (i = 0; i < this.faces.length; ++i) {
    for (j = 0; j < 4; ++j) {
      if (this.uv[j].length > 0) {
        var uv1, uv2, uv3;
        uv1 = this.uv[j][this.faces[i].a];
        uv2 = this.uv[j][this.faces[i].b];
        uv3 = this.uv[j][this.faces[i].c];
        geometry.faceVertexUvs[j].push([uv1, uv2, uv3]);
      }
    }
  }

  geometry.computeBoundingSphere();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  return geometry;
};


/**
 * @callback Mesh~onLoad
 * @param {THREE.Geometry} geometry
 */

/**
 * @param {String} path
 * @param {Mesh~onLoad} callback
 */
Mesh.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var version, magic, mesh;

    magic = rh.readStrLen(7);
    rh.skip(1);

    if (magic === 'ZMS0005') {
      version = 5;
    } else if (magic === 'ZMS0006') {
      version = 6;
    } else if (magic === 'ZMS0007') {
      version = 7;
    } else if (magic === 'ZMS0008') {
      version = 8;
    } else {
      throw 'Unexpected ZMS magic header ' + magic + ' in ' + path;
    }

    if (version >= 7) {
      mesh = Mesh.loadMesh8(rh);
    } else {
      mesh = Mesh.loadMesh6(rh);
    }

    callback(mesh.create());
  });
};
