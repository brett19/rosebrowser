'use strict';


function BinaryReader(arrayBuffer) {
  this.buffer = new Uint8Array(arrayBuffer);
  this.view = new DataView(arrayBuffer);
  this.pos = 0;
}
BinaryReader.prototype.readFloat = function() {
  var res = this.view.getFloat32(this.pos, true);
  this.pos += 4;
  return res;
}
BinaryReader.prototype.readUint8 = function() {
  return this.buffer[this.pos++];
};
BinaryReader.prototype.readUint16 = function() {
  var res =
      this.buffer[this.pos+1] << 8 |
      this.buffer[this.pos+0];
  this.pos += 2;
  return res;
};
BinaryReader.prototype.readUint32 = function() {
  var res =
      this.buffer[this.pos+3] << 24 |
      this.buffer[this.pos+2] << 16 |
      this.buffer[this.pos+1] << 8 |
      this.buffer[this.pos+0];
  this.pos += 4;
  return res;
};
BinaryReader.prototype.readStr = function() {
  var startPos = this.pos;
  while (this.buffer[this.pos++]);
  var strArray = this.buffer.subarray(startPos, this.pos-1);
  return String.fromCharCode.apply(null, strArray);
};
BinaryReader.prototype.skip = function(num) {
  this.pos += num;
};

BinaryReader.prototype.readVector2 = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  return new THREE.Vector2(x, y);
};
BinaryReader.prototype.readVector3 = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  return new THREE.Vector3(x, y, z);
};
BinaryReader.prototype.readQuat = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  var w = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};
BinaryReader.prototype.readBadQuat = function() {
  var w = this.readFloat();
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};



var ROSE_DATA_BASE = 'http://home.br19.com:82/rosedata/';

var ROSELoader = {};
ROSELoader.load = function(path, callback) {
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_BASE + path, function (buffer) {
    callback(new BinaryReader(buffer));
  });
};



var ZSCPROPTYPE = {
  Position: 1,
  Rotation: 2,
  Scale: 3,
  AxisRotation: 4,
  BoneIndex: 5,
  DummyIndex: 6,
  Parent: 7,
  Animation: 8,
  Collision: 29,
  ConstantAnimation: 30,
  VisibleRangeSet: 31,
  UseLightmap: 32
};
var ZSCLoader = {};
ZSCLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = {};

    data.models = [];
    var modelCount = b.readUint16();
    for (var i = 0; i < modelCount; ++i) {
      data.models.push(b.readStr());
    }

    data.materials = [];
    var materialCount = b.readUint16();
    for (var i = 0; i < materialCount; ++i) {
      var material = {};
      material.texturePath = b.readStr();
      material.forSkinning = b.readUint16() != 0;
      material.alphaEnabled = b.readUint16() != 0;
      material.twoSided = b.readUint16() != 0;
      material.alphaTestEnabled = b.readUint16() != 0;
      material.alphaRef = b.readUint16();
      material.depthTestEnabled = b.readUint16() != 0;
      material.depthWriteEnabled = b.readUint16() != 0;
      material.blendType = b.readUint16();
      material.useSpecular = b.readUint16() != 0;
      material.alpha = b.readFloat();
      material.glowType = b.readUint16();
      material.glowColour = [b.readFloat(), b.readFloat(), b.readFloat()];
      data.materials.push(material);
    }

    data.effects = [];
    var effectCount = b.readUint16();
    for (var i = 0; i < effectCount; ++i) {
      data.effects.push(b.readStr());
    }

    data.objects = [];
    var objectCount = b.readUint16();
    for (var i = 0; i < objectCount; ++i) {
      var obj = {};

      /*bounding cylinder*/ b.skip(3*4);

      obj.parts = [];
      obj.effects = [];
      var partCount = b.readUint16();
      if (partCount > 0) {
        for (var j = 0; j < partCount; ++j) {
          var part = {};

          part.modelIdx = b.readUint16();
          part.materialIdx = b.readUint16();

          var propertyType = 0;
          while ((propertyType = b.readUint8()) != 0) {
            var propertySize = b.readUint8();

            if (propertyType == ZSCPROPTYPE.Position) {
              part.position = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Rotation) {
              part.rotation = [b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Scale) {
              part.scale = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.AxisRotation) {
              /*part.axisRotation =*/ [b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Parent) {
              part.parent = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.Collision) {
              part.collisionMode = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.ConstantAnimation) {
              part.animPath = b.readStrLen(propertySize);
            } else if (propertyType == ZSCPROPTYPE.VisibleRangeSet) {
              /*part.visibleRangeSet =*/ b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.UseLightmap) {
              part.useLightmap = b.readUint16() != 0;
            } else if (propertyType == ZSCPROPTYPE.BoneIndex) {
              part.boneIndex = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.DummyIndex) {
              part.dummyIndex = b.readUint16();
            } else {
              b.skip(propertySize);
            }
          }

          obj.parts.push(part);
        }

        var effectCount = b.readUint16();
        for (var j = 0; j < effectCount; ++j) {
          var effect = {};

          effect.type = b.readUint16();
          effect.effectIdx = b.readUint16();

          var propertyType = 0;
          while ((propertyType = b.readUint8()) != 0) {
            var propertySize = b.readUint8();

            if (propertyType == ZSCPROPTYPE.Position) {
              effect.position = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Rotation) {
              effect.rotation = [b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Scale) {
              effect.scale = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Parent) {
              effect.parent = b.readUint16();
            } else {
              b.skip(propertySize);
            }
          }

          obj.effects.push(effect);
        }

        /*bounding box*/ b.skip(2*3*4);
      } else {
        obj = null;
      }

      data.objects.push(obj);
    }

    callback(data);
  });
};




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

    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    callback(geometry);
  });
};


/**
 * @note Returns texture immediately, but doesn't load till later.
 */
var ROSETexLoader = {};
ROSETexLoader.load = function(path, callback) {
  var ddsLoader = new THREE.DDSLoader();
  var tex = ddsLoader.load( ROSE_DATA_BASE + path, function() {
    if (callback) {
      callback();
    }
  });
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  return tex;
};



function ZMDSkeleton() {
  this.bones = [];
  this.dummies = [];
}
/**
 * Creates a skeleton object from this skeleton data.
 */
ZMDSkeleton.prototype.create = function(rootObj) {
  var bones = [];

  for (var i = 0; i < this.bones.length; ++i) {
    var b = this.bones[i];

    var boneX = new THREE.Bone(rootObj);
    boneX.name = b.name;
    boneX.position.set(b.position.x, b.position.y, b.position.z);
    boneX.quaternion.set(b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w);
    boneX.scale.set(1, 1, 1);

    if (b.parent == -1) {
      rootObj.add(boneX);
    } else {
      bones[b.parent].add(boneX);
    }

    bones.push(boneX);
  }

  var skel = new THREE.Skeleton(bones);

  // The root object has to be fully updated!
  rootObj.updateMatrixWorld();

  // Generate the inverse matrices for skinning
  skel.calculateInverses();

  return skel;
};
var ZMDLoader = {};
ZMDLoader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var skel = new ZMDSkeleton();

    rh.skip(7);

    var boneCount = rh.readUint32();
    for (var i = 0; i < boneCount; ++i) {
      var bone = {};
      bone.parent = rh.readUint32();
      bone.name = rh.readStr();
      bone.position = rh.readVector3().divideScalar(100);
      bone.rotation = rh.readBadQuat();

      if (i == 0) {
        bone.parent = -1;
      }

      skel.bones.push(bone);
    }

    //var dummyCount = rh.readUint32();

    callback(skel);
  });
};




var ZMOCTYPE = {
  None: 1 << 0,
  Position: 1 << 1,
  Rotation: 1 << 2
};
function ZMOAnimation() {
  this.fps = 0;
  this.frameCount = 0;
  this.channels = [];
}
ZMOAnimation.prototype.createForSkeleton = function(name, rootObj, skel) {
  var animD = {
    name: name,
    fps: this.fps,
    length: this.frameCount / this.fps,
    hierarchy: []
  };

  // Set up all the base bone animations
  for (var i = 0; i < skel.bones.length; ++i) {
    var b = skel.bones[i];

    var animT = {
      parent: i,
      keys: []
    };
    for (var j = 0; j < this.frameCount; ++j) {
      animT.keys.push({
        time: j / this.fps,
        pos: [b.position.x, b.position.y, b.position.z],
        rot: [b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w],
        scl: [1, 1, 1]
      });
    }
    animD.hierarchy.push(animT);
  }

  // Apply the channel transformations
  for (var j = 0; j < this.channels.length; ++j) {
    var c = this.channels[j];
    for (var i = 0; i < this.frameCount; ++i) {
      var thisKey = animD.hierarchy[c.index].keys[i];
      if (c.type == ZMOCTYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == ZMOCTYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = skel.bones;
  return anim;
};
var ZMOLoader = {};
ZMOLoader.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var anim = new ZMOAnimation();

    rh.skip(8);

    anim.fps = rh.readUint32();
    anim.frameCount = rh.readUint32();
    var channelCount = rh.readUint32();

    var channelData = [];
    for (var i = 0; i < channelCount; ++i) {
      var channelType = rh.readUint32();
      var channelIndex = rh.readUint32();
      channelData.push({type: channelType, index: channelIndex, frames: []});
    }

    for (var i = 0; i < anim.frameCount; ++i) {
      for (var j = 0; j < channelCount; ++j) {
        if (channelData[j].type == ZMOCTYPE.Position) {
          channelData[j].frames.push(rh.readVector3().divideScalar(100));
        } else if (channelData[j].type == ZMOCTYPE.Rotation) {
          channelData[j].frames.push(rh.readBadQuat());
        }
      }
    }
    anim.channels = channelData;

    callback(anim);
  });
};




THREE.XHRLoader.prototype.crossOrigin = 'anonymous';
THREE.ImageUtils.crossOrigin = 'anonymous';






var cube = null;
var skhp = null;
var fnhp = null;
var vnhp = null;


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor( 0x888888, 1 );


camera.position.x = 1.5;
camera.position.y = -6;
camera.position.z = 4;
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));




var clock = new THREE.Clock();
var render = function () {
  requestAnimationFrame(render);

  var delta = clock.getDelta();
  THREE.AnimationHandler.update( delta );

  renderer.render(scene, camera);
};

render();


var map1 = ROSETexLoader.load('3DDATA/NPC/PLANT/JELLYBEAN1/BODY02.DDS');
var material1 = new THREE.MeshBasicMaterial({color: 0xdddddd, map: map1});
material1.skinning = true;



var rootObj = new THREE.Object3D();

ZSCLoader.load('3DDATA/NPC/PART_NPC.ZSC', function(data) {
  console.log(data);
});

ZMSLoader.load('3DDATA/NPC/PLANT/JELLYBEAN1/BODY02.ZMS', function (geometry) {
  ZMSLoader.load('3DDATA/NPC/PLANT/JELLYBEAN1/BODY01.ZMS', function (geometry2) {
    ZMDLoader.load('3DDATA/NPC/PLANT/JELLYBEAN1/JELLYBEAN2_BONE.ZMD', function(zmdData) {
      ZMOLoader.load('3DDATA/MOTION/NPC/JELLYBEAN1/JELLYBEAN1_WALK.ZMO', function(zmoData) {
        var skel = zmdData.create(rootObj);

        cube = new THREE.SkinnedMesh(geometry, material1);
        cube.bind(skel);

        var cube2 = new THREE.SkinnedMesh(geometry2, material1);
        cube2.bind(skel);

        var anim = zmoData.createForSkeleton('test', rootObj, skel);
        anim.play();

        rootObj.add(cube);
        rootObj.add(cube2);
        scene.add(rootObj);

      });
    });
  });
});
