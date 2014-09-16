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
  data.vertices = rh.readFloatArray(3 * vertices);

  if (format & Mesh.FORMAT.NORMAL) {
    data.normals = rh.readFloatArray(3 * vertices);
  }

  if (format & Mesh.FORMAT.COLOUR) {
    data.colours = rh.readFloatArray(4 * vertices);
  }

  if (format & (Mesh.FORMAT.BLEND_INDEX | Mesh.FORMAT.BLEND_WEIGHT)) {
    var skinIdx = 0;
    data.skin.weights = new Float32Array(4 * vertices);
    data.skin.indices = new Float32Array(4 * vertices);

    for (i = 0; i < vertices; ++i) {
      data.skin.weights[skinIdx + 0] = rh.readFloat();
      data.skin.weights[skinIdx + 1] = rh.readFloat();
      data.skin.weights[skinIdx + 2] = rh.readFloat();
      data.skin.weights[skinIdx + 3] = rh.readFloat();

      data.skin.indices[skinIdx + 0] = boneTable[rh.readUint16()];
      data.skin.indices[skinIdx + 1] = boneTable[rh.readUint16()];
      data.skin.indices[skinIdx + 2] = boneTable[rh.readUint16()];
      data.skin.indices[skinIdx + 3] = boneTable[rh.readUint16()];

      skinIdx += 4;
    }
  } else {
    data.skin.weights = null;
    data.skin.indices = null;
  }

  if (format & Mesh.FORMAT.TANGENT) {
    data.tangents = rh.readFloatArray(3 * vertices);
  }

  if (format & Mesh.FORMAT.UV1) {
    data.uv[0] = rh.readFloatArray(2 * vertices);
  }

  if (format & Mesh.FORMAT.UV2) {
    data.uv[1] = rh.readFloatArray(2 * vertices);
  }

  if (format & Mesh.FORMAT.UV3) {
    data.uv[2] = rh.readFloatArray(2 * vertices);
  }

  if (format & Mesh.FORMAT.UV4) {
    data.uv[2] = rh.readFloatArray(2 * vertices);
  }

  faces = rh.readUint16();
  data.faces = rh.readUint16Array(3 * faces);

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
 * @returns {THREE.BufferGeometry}
 */
Mesh.prototype.createBufferGeometry = function() {
  var geometry;
  geometry = new THREE.BufferGeometry();

  geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
  geometry.addAttribute('index', new THREE.BufferAttribute(this.faces, 3));

  if (this.skin.weights) {
    geometry.addAttribute('skinWeight', new THREE.BufferAttribute(this.skin.weights, 4));
  }

  if (this.skin.indices) {
    geometry.addAttribute('skinIndex', new THREE.BufferAttribute(this.skin.indices, 4));
  }

  if (this.uv[0]) {
    geometry.addAttribute('uv', new THREE.BufferAttribute(this.uv[0], 2));
  }

  if (this.uv[1]) {
    geometry.addAttribute('uv2', new THREE.BufferAttribute(this.uv[1], 2));
  }

  if (this.uv[2] || this.uv[3]) {
    // TODO: Fallback to normal Geometry
    throw 'BufferGeometry does not support more than 2 uv channels!';
  }

  geometry.computeBoundingSphere();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  return geometry;
};


/**
 * @returns {THREE.Geometry}
 */
Mesh.prototype.createGeometry = function() {
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
      mesh = mesh.createBufferGeometry();
    } else {
      mesh = Mesh.loadMesh6(rh);
      mesh = mesh.createGeometry();
    }

    callback(mesh);
  });
};
