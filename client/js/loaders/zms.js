/**
 * @constructor
 * @property {{min: Vector3, max: Vector3}} bounds
 * @property {Float32Array} vertices
 * @property {Float32Array?} normals
 * @property {Float32Array?} tangents
 * @property {Float32Array?} colours
 * @property {Float32Array?} faces
 * @property {Float32Array?} skinWeights
 * @property {Float32Array?} skinIndices
 * @property {Float32Array?[]} uv
 */
var Mesh = function() {
  this.bounds = {};
  this.uv = [];
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
    data.skinWeights = new Float32Array(4 * vertices);
    data.skinIndices = new Float32Array(4 * vertices);

    for (i = 0; i < vertices; ++i) {
      data.skinWeights[skinIdx + 0] = rh.readFloat();
      data.skinWeights[skinIdx + 1] = rh.readFloat();
      data.skinWeights[skinIdx + 2] = rh.readFloat();
      data.skinWeights[skinIdx + 3] = rh.readFloat();

      data.skinIndices[skinIdx + 0] = boneTable[rh.readUint16()];
      data.skinIndices[skinIdx + 1] = boneTable[rh.readUint16()];
      data.skinIndices[skinIdx + 2] = boneTable[rh.readUint16()];
      data.skinIndices[skinIdx + 3] = boneTable[rh.readUint16()];

      skinIdx += 4;
    }
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
  var bones, boneTable, faces, format, i, idx, vertices;
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
  data.vertices = new Float32Array(3 * vertices);
  for (i = 0, idx = 0; i < vertices; i += 1, idx += 3) {
    rh.skip(4);
    data.vertices[idx    ] = rh.readFloat();
    data.vertices[idx + 1] = rh.readFloat();
    data.vertices[idx + 2] = rh.readFloat();
  }

  if (format & Mesh.FORMAT.NORMAL) {
    data.normals = new Float32Array(3 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 3) {
      rh.skip(4);
      data.normals[idx + 0] = rh.readFloat();
      data.normals[idx + 1] = rh.readFloat();
      data.normals[idx + 2] = rh.readFloat();
    }
  }

  if (format & Mesh.FORMAT.COLOUR) {
    data.colours = new Float32Array(4 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 4) {
      rh.skip(4);
      data.colours[idx + 0] = rh.readFloat();
      data.colours[idx + 1] = rh.readFloat();
      data.colours[idx + 2] = rh.readFloat();
      data.colours[idx + 3] = rh.readFloat();
    }
  }

  if (format & (Mesh.FORMAT.BLEND_INDEX | Mesh.FORMAT.BLEND_WEIGHT)) {
    data.skinWeights = new Float32Array(4 * vertices);
    data.skinIndices = new Float32Array(4 * vertices);

    for (i = 0, idx = 0; i < vertices; i += 1, idx += 4) {
      rh.skip(4);
      data.skinWeights[idx + 0] = rh.readFloat();
      data.skinWeights[idx + 1] = rh.readFloat();
      data.skinWeights[idx + 2] = rh.readFloat();
      data.skinWeights[idx + 3] = rh.readFloat();

      data.skinIndices[idx + 0] = boneTable[rh.readUint32()];
      data.skinIndices[idx + 1] = boneTable[rh.readUint32()];
      data.skinIndices[idx + 2] = boneTable[rh.readUint32()];
      data.skinIndices[idx + 3] = boneTable[rh.readUint32()];
    }
  }

  if (format & Mesh.FORMAT.TANGENT) {
    data.tangents = new Float32Array(3 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 3) {
      rh.skip(4);
      data.tangents[idx + 0] = rh.readFloat();
      data.tangents[idx + 1] = rh.readFloat();
      data.tangents[idx + 2] = rh.readFloat();
    }
  }

  if (format & Mesh.FORMAT.UV1) {
    data.uv[0] = new Float32Array(2 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 2) {
      rh.skip(4);
      data.uv[0][idx + 0] = rh.readFloat();
      data.uv[0][idx + 1] = rh.readFloat();
    }
  }

  if (format & Mesh.FORMAT.UV2) {
    data.uv[1] = new Float32Array(2 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 2) {
      rh.skip(4);
      data.uv[1][idx + 0] = rh.readFloat();
      data.uv[1][idx + 1] = rh.readFloat();
    }
  }

  if (format & Mesh.FORMAT.UV3) {
    data.uv[2] = new Float32Array(2 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 2) {
      rh.skip(4);
      data.uv[2][idx + 0] = rh.readFloat();
      data.uv[2][idx + 1] = rh.readFloat();
    }
  }

  if (format & Mesh.FORMAT.UV4) {
    data.uv[3] = new Float32Array(2 * vertices);
    for (i = 0, idx = 0; i < vertices; i += 1, idx += 2) {
      rh.skip(4);
      data.uv[3][idx + 0] = rh.readFloat();
      data.uv[3][idx + 1] = rh.readFloat();
    }
  }

  faces = rh.readUint32();
  data.faces = new Uint16Array(3 * faces);
  for (i = 0, idx = 0; i < faces; i += 1, idx += 3) {
    rh.skip(4);
    data.faces[idx + 0] = rh.readUint32();
    data.faces[idx + 1] = rh.readUint32();
    data.faces[idx + 2] = rh.readUint32();
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

  if (this.skinWeights) {
    geometry.addAttribute('skinWeight', new THREE.BufferAttribute(this.skinWeights, 4));
  }

  if (this.skinIndices) {
    geometry.addAttribute('skinIndex', new THREE.BufferAttribute(this.skinIndices, 4));
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

  geometry.dynamic = false;
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

    callback(mesh.createBufferGeometry());
  });
};
