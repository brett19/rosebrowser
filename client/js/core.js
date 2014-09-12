'use strict';

var ZZ_SCALE_IN = 0.01;
var ZZ_SCALE_OUT = 100;

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

    data.meshes = [];
    var meshCount = b.readUint16();
    for (var i = 0; i < meshCount; ++i) {
      data.meshes.push(b.readStr());
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

          part.meshIdx = b.readUint16();
          part.materialIdx = b.readUint16();

          var propertyType = 0;
          while ((propertyType = b.readUint8()) != 0) {
            var propertySize = b.readUint8();

            if (propertyType == ZSCPROPTYPE.Position) {
              part.position = b.readVector3().multiplyScalar(ZZ_SCALE_IN).toArray();
            } else if (propertyType == ZSCPROPTYPE.Rotation) {
              part.rotation = b.readBadQuat().toArray();
            } else if (propertyType == ZSCPROPTYPE.Scale) {
              part.scale = b.readVector3().toArray();
            } else if (propertyType == ZSCPROPTYPE.AxisRotation) {
              /*part.axisRotation =*/ b.readBadQuat();
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




var CHRLoader = {};
CHRLoader.load = function(path, callback) {
  ROSELoader.load(path, function (b) {
    var data = {};

    data.skeletons = [];
    var skeletonCount = b.readUint16();
    for (var i = 0; i < skeletonCount; ++i) {
      data.skeletons.push(b.readStr());
    }

    data.animations = [];
    var animationCount = b.readUint16();
    for (var i = 0; i < animationCount; ++i) {
      data.animations.push(b.readStr());
    }

    data.effects = [];
    var effectCount = b.readUint16();
    for (var i = 0; i < effectCount; ++i) {
      data.effects.push(b.readStr());
    }

    data.characters = [];
    var characterCount = b.readUint16();
    for (var i = 0; i < characterCount; ++i) {
      var char = {};

      var charEnabled = b.readUint8() != 0;
      if (charEnabled) {
        char.skeletonIdx = b.readUint16();
        char.name = b.readStr();

        char.models = [];
        var modelCount = b.readUint16();
        for (var j = 0; j < modelCount; ++j) {
          char.models.push(b.readUint16());
        }

        char.animations = {};
        var animationCount = b.readUint16();
        for (var j = 0; j < animationCount; ++j) {
          var animType = b.readUint16();
          char.animations[animType] = b.readUint16();
        }

        char.effects = [];
        var effectCount = b.readUint16();
        for (var j = 0; j < effectCount; ++j) {
          var effect = {};
          effect.boneIdx = b.readUint16();
          effect.effectIdx = b.readUint16();
          char.effects.push(effect);
        }

      } else {
        char = null;
      }

      data.characters.push(char);
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


/**
 * @note Returns texture immediately, but doesn't load till later.
 */
var ROSETexLoader = {};
ROSETexLoader.load = function(path, callback) {
  var tex = DDS.Loader.load(path, function() {
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

  var fakeRoot = new THREE.Object3D();

  for (var i = 0; i < this.bones.length; ++i) {
    var b = this.bones[i];

    var boneX = new THREE.Bone(rootObj);
    boneX.name = b.name;
    boneX.position.set(b.position.x, b.position.y, b.position.z);
    boneX.quaternion.set(b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w);
    boneX.scale.set(1, 1, 1);

    if (b.parent == -1) {
      fakeRoot.add(boneX);
    } else {
      bones[b.parent].add(boneX);
    }

    bones.push(boneX);
  }

  var skel = new THREE.Skeleton(bones);

  // The root object has to be fully updated!
  fakeRoot.updateMatrixWorld();

  // Generate the inverse matrices for skinning
  skel.calculateInverses();

  fakeRoot.remove(bones[0]);
  rootObj.add(bones[0]);

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
      bone.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
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
ZMOAnimation.prototype.createForStatic = function(name, rootObj) {
  var animD = {
    name: name,
    fps: this.fps,
    length: this.frameCount / this.fps,
    hierarchy: []
  };

  var animT = {
    parent: i,
    keys: []
  };
  var b = rootObj;
  for (var j = 0; j < this.frameCount; ++j) {
    animT.keys.push({
      time: j / this.fps,
      pos: [b.position.x, b.position.y, b.position.z],
      rot: [b.rotation.x, b.rotation.y, b.rotation.z, b.rotation.w],
      scl: [b.scale.x, b.scale.y, b.scale.z]
    });
  }
  animD.hierarchy.push(animT);

  // Apply the channel transformations
  for (var j = 0; j < this.channels.length; ++j) {
    var c = this.channels[j];
    for (var i = 0; i < this.frameCount; ++i) {
      if (c.index != 0) {
        console.log('bad index');
      }
      var thisKey = animD.hierarchy[c.index].keys[i];
      if (c.type == ZMOCTYPE.Position) {
        thisKey.pos = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      } else if (c.type == ZMOCTYPE.Rotation) {
        thisKey.rot = [c.frames[i].x, c.frames[i].y, c.frames[i].z, c.frames[i].w];
      } else if (c.type == ZMOCTYPE.Scale) {
        thisKey.scl = [c.frames[i].x, c.frames[i].y, c.frames[i].z];
      }
    }
  }

  // Create the actual animation
  var anim = new THREE.Animation(rootObj, animD);
  anim.hierarchy = [rootObj];
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
          channelData[j].frames.push(rh.readVector3().multiplyScalar(ZZ_SCALE_IN));
        } else if (channelData[j].type == ZMOCTYPE.Rotation) {
          channelData[j].frames.push(rh.readBadQuat());
        }
      }
    }
    anim.channels = channelData;

    callback(anim);
  });
};

var cameraAnimator = null;
function CameraAnimationHandler(camera, zmoData) {
  this.time = 0;
  this.camera = camera;
  this.data = zmoData;
  this.length = this.data.frameCount / this.data.fps;
  if (this.data.channels.length != 4) {
    throw new Error('Camera ZMO has wrong number of channels');
  }
}
function interpFrame(frames, frameBase, weight) {
  var frame0 = frameBase;
  var frame1 = frameBase + 1;
  if (frame1 >= frames.length) {
    frame1 -= frames.length;
  }
  return frames[frame0].lerp(frames[frame1], weight);
}
CameraAnimationHandler.prototype.update = function(delta) {
  this.time += delta;
  if (this.time >= this.length) {
    this.time -= this.length;
  } else if (this.time < 0) {
    this.time += this.length;
  }

  var frameNum = Math.floor(this.time * this.data.fps);
  var blendWeight = this.time - (frameNum / this.data.fps);

  var eyePos = interpFrame(this.data.channels[0].frames, frameNum, blendWeight);
  var targetPos = interpFrame(this.data.channels[1].frames, frameNum, blendWeight);
  var upPos = interpFrame(this.data.channels[2].frames, frameNum, blendWeight);

  this.camera.up.set(upPos.x*ZZ_SCALE_OUT, upPos.y*ZZ_SCALE_OUT, upPos.z*ZZ_SCALE_OUT);
  this.camera.position.set(eyePos.x, eyePos.y, eyePos.z);
  this.camera.lookAt(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z));
};



function HIMData() {
  this.width = 0;
  this.height = 0;
  this.map = [];
}
var HIMLoader = {};
HIMLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = new HIMData();
    data.width = b.readUint32();
    data.height = b.readUint32();
    /*patchGridCount*/ b.readUint32();
    /*patchSize*/ b.readFloat();
    for (var i = 0; i < data.width*data.height; ++i) {
      data.map.push(b.readFloat());
    }
    callback(data);
  });
};


var IFOBLOCKTYPE = {
  MapInformation: 0,
  Object: 1,
  NPC: 2,
  Building: 3,
  Sound: 4,
  Effect: 5,
  Animation: 6,
  WaterPatch: 7,
  MonsterSpawn: 8,
  WaterPlane: 9,
  WarpPoint: 10,
  CollisionObject: 11,
  EventObject: 12
};
function IFOData() {
  this.buildings = [];
  this.objects = [];
}
var IFOLoader = {};
IFOLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = new IFOData();

    var blockCount = b.readUint32();
    function readMapObject() {
      var obj = {};
      obj.name = b.readByteStr();
      obj.warpId = b.readUint16();
      obj.eventId = b.readUint16();
      obj.objectType = b.readUint32();
      obj.objectId = b.readUint32();
      /*obj.mapPosition*/ b.skip(2*4);
      obj.rotation = b.readQuat();
      obj.position = b.readVector3().multiplyScalar(ZZ_SCALE_IN);
      obj.scale = b.readVector3();
      return obj;
    }
    function readBlock(blockType) {
      if (blockType === IFOBLOCKTYPE.Building) {
        var entryCount = b.readUint32();
        for (var i = 0; i < entryCount; ++i) {
          var obj = readMapObject();
          data.buildings.push(obj);
        }
      } else if (blockType === IFOBLOCKTYPE.Object) {
        var entryCount = b.readUint32();
        for (var i = 0; i < entryCount; ++i) {
          var obj = readMapObject();
          data.objects.push(obj);
        }
      }
    }
    for (var i = 0; i < blockCount; ++i) {
      var blockType = b.readUint32();
      var blockOffset = b.readUint32();
      var nextBlockPos = b.tell();
      b.seek(blockOffset);
      readBlock(blockType);
      b.seek(nextBlockPos);
    }

    callback(data);
  });
};







THREE.XHRLoader.prototype.crossOrigin = 'anonymous';
THREE.ImageUtils.crossOrigin = 'anonymous';




var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var rendererEl = document.body;
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
rendererEl.appendChild(renderer.domElement);

renderer.setClearColor( 0x888888, 1 );

var cameraBase = new THREE.Object3D();
cameraBase.position.set(5200, 5200, 0);
scene.add(cameraBase);

camera.up = new THREE.Vector3(0, 0, 1);
camera.position.x = -5;
camera.position.y = 5;
camera.position.z = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));
cameraBase.add(camera);

var controls = null;

//*
controls = new THREE.OrbitControls( camera );
controls.damping = 0.2;
//*/

var axisHelper = new THREE.AxisHelper( 5 );
axisHelper.position.x = 5201;
axisHelper.position.y = 5201;
axisHelper.position.z = 40;
scene.add( axisHelper );

var axisHelper2 = new THREE.AxisHelper( 20 );
axisHelper2.position.x = 0;
axisHelper2.position.y = 0;
axisHelper2.position.z = 0;
scene.add( axisHelper2 );

/*
var animPath = '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO';
ZMOLoader.load(animPath, function(zmoData) {
  cameraAnimator = new CameraAnimationHandler(camera, zmoData);
});
//*/

var defaultMat = new THREE.MeshPhongMaterial({ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading});

var terrainTex = ROSETexLoader.load('3DDATA/TERRAIN/TILES/JUNON/JD/T021_04.DDS');
terrainTex.wrapS = THREE.RepeatWrapping;
terrainTex.wrapT = THREE.RepeatWrapping;
var terrainMat = new THREE.MeshLambertMaterial({map: terrainTex});

var worldTree = new THREE.Octree( {
  // uncomment below to see the octree (may kill the fps)
  //scene: scene,
  // when undeferred = true, objects are inserted immediately
  // instead of being deferred until next octree.update() call
  // this may decrease performance as it forces a matrix update
  undeferred: false,
  // set the max depth of tree
  depthMax: Infinity,
  // max number of objects before nodes split or merge
  objectsThreshold: 8,
  // percent between 0 and 1 that nodes will overlap each other
  // helps insert objects that lie over more than one node
  overlapPct: 0.15
} );


var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.1 );
directionalLight.position.set( 100, 100, 100 );
scene.add( directionalLight );1

var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
hemiLight.color.setHSL( 0.6, 1, 0.75 );
hemiLight.groundColor.setHSL( 0.1, 0.8, 0.7 );
hemiLight.position.z = 500;
scene.add( hemiLight );


var clock = new THREE.Clock();
var render = function () {
  requestAnimationFrame(render, rendererEl);
  var delta = clock.getDelta();
  THREE.AnimationHandler.update( delta );
  if (controls) {
    controls.update(delta);
  }

  if (moveObj) {
    var origin = moveTowards.clone();
    origin.sub(new THREE.Vector2(moveObj.position.x, moveObj.position.y));
    if (origin.lengthSq() > 0.07*0.07) {
      origin.normalize();
      origin.multiplyScalar(0.07);
    }
    moveObj.position.add(new THREE.Vector3(origin.x, origin.y, 0));

    var ray = new THREE.Raycaster(new THREE.Vector3(moveObj.position.x, moveObj.position.y, 200), new THREE.Vector3(0, 0, -1));
    var octreeObjects = worldTree.search( ray.ray.origin, ray.ray.far, true, ray.ray.direction );
    var inters = ray.intersectOctreeObjects( octreeObjects );
    if (inters.length > 0) {
      var p = inters[0].point;
      moveObj.position.set(p.x, p.y, p.z);
    }
  }

  if (cameraAnimator) {
    cameraAnimator.update(delta);
  }

  renderer.render(scene, camera);

  worldTree.update();
};
render();




function makeZscMaterial(zscMat) {
  var texture = ROSETexLoader.load(zscMat.texturePath);
  //texture.anisotropy = 4;
  var material = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture});
  material.skinning = zscMat.forSkinning;
  if (zscMat.twoSided) {
    material.side = THREE.DoubleSide;
  }
  if (zscMat.alphaEnabled) {
    material.transparent = true;
  }

  // TODO: temporary hack!
  if (!zscMat.forSkinning) {
    if (zscMat.alphaTestEnabled) {
      material.alphaTest = zscMat.alphaRef / 255;
    } else {
      material.alphaTest = 0;
    }
  }
  material.opacity = zscMat.alpha;
  material.depthTest = zscMat.depthTestEnabled;
  material.depthWrite = zscMat.depthWriteEnabled;
  return material;
}

function createZscObject(zscData, modelIdx) {
  var model = zscData.objects[modelIdx];

  var modelObj = new THREE.Object3D();
  modelObj.visible = false;

  var loadWarn = setTimeout(function() {
    console.log('Model took a long time to load...');
  }, 5000);

  var partMeshs = [];
  function completeLoad() {
    clearTimeout(loadWarn);
    for (var i = 0; i < partMeshs.length; ++i) {
      var part = model.parts[i];

      if (i == 0) {
        modelObj.add(partMeshs[i]);
      } else {
        partMeshs[part.parent-1].add(partMeshs[i]);
      }

    }
    modelObj.visible = true;
  }
  var loadedCount = 0;

  for (var i = 0; i < model.parts.length; ++i) {
    (function(partIdx, part) {
      var meshPath = zscData.meshes[part.meshIdx];

      var material = makeZscMaterial(zscData.materials[part.materialIdx]);

      ZMSLoader.load(meshPath, function (geometry) {
        var partMesh = new THREE.Mesh(geometry, material);
        partMesh.position.set(part.position[0], part.position[1], part.position[2]);
        partMesh.quaternion.set(part.rotation[0], part.rotation[1], part.rotation[2], part.rotation[3]);
        partMesh.scale.set(part.scale[0], part.scale[1], part.scale[2]);
        partMeshs[partIdx] = partMesh;

        if (part.animPath) {
          ZMOLoader.load(part.animPath, function(zmoData) {
            var anim = zmoData.createForStatic(part.animPath, partMeshs[partIdx]);
            anim.play();
          });
        }

        loadedCount++;
        if (loadedCount == model.parts.length) {
          completeLoad();
        }
      });
    })(i, model.parts[i]);
  }

  return modelObj;
}

var projector = new THREE.Projector();

var worldList = [];

//*
ZSCLoader.load('3DDATA/JUNON/LIST_CNST_JPT.ZSC', function(cnstData) {
  ZSCLoader.load('3DDATA/JUNON/LIST_DECO_JPT.ZSC', function (decoData) {
    for (var iy = 31; iy <= 32; ++iy) {
      for (var ix = 32; ix <= 32; ++ix) {
        (function (cx, cy) {
          var himPath = '3DDATA/MAPS/JUNON/TITLE_JPT/' + cx + '_' + cy + '.HIM';
          HIMLoader.load(himPath, function (himData) {
            var geom = new THREE.Geometry();

            for (var vy = 0; vy < 65; ++vy) {
              for (var vx = 0; vx < 65; ++vx) {
                geom.vertices.push(new THREE.Vector3(
                    vx * 2.5, vy * 2.5, himData.map[(64 - vy) * 65 + (vx)] * ZZ_SCALE_IN
                ));
              }
            }

            for (var fy = 0; fy < 64; ++fy) {
              for (var fx = 0; fx < 64; ++fx) {
                var v1 = (fy + 0) * 65 + (fx + 0);
                var v2 = (fy + 0) * 65 + (fx + 1);
                var v3 = (fy + 1) * 65 + (fx + 0);
                var v4 = (fy + 1) * 65 + (fx + 1);
                var uv1 = new THREE.Vector2((fx+0)/4,(fy+0)/4);
                var uv2 = new THREE.Vector2((fx+1)/4,(fy+0)/4);
                var uv3 = new THREE.Vector2((fx+0)/4,(fy+1)/4);
                var uv4 = new THREE.Vector2((fx+1)/4,(fy+1)/4);
                geom.faces.push(new THREE.Face3(v1, v2, v3));
                geom.faces.push(new THREE.Face3(v4, v3, v2));
                geom.faceVertexUvs[0].push([uv1, uv2, uv3]);
                geom.faceVertexUvs[0].push([uv4, uv3, uv2]);
              }
            }

            geom.computeBoundingSphere();
            geom.computeBoundingBox();
            geom.computeFaceNormals();
            geom.computeVertexNormals();

            var chunkMesh = new THREE.Mesh(geom, terrainMat);
            chunkMesh.position.x = (cx - 32) * 160 - 80 + 5200;
            chunkMesh.position.y = (32 - cy) * 160 - 80 + 5200;
            scene.add(chunkMesh);

            worldTree.add(chunkMesh);
            worldList.push(chunkMesh);

            /*
            var ifoPath = '3DDATA/MAPS/JUNON/TITLE_JPT/' + cx + '_' + cy + '.IFO';
            IFOLoader.load(ifoPath, function(ifoData) {
              for (var i = 0; i < ifoData.objects.length; ++i) {
                var objData = ifoData.objects[i];
                var obj = createZscObject(decoData, objData.objectId);
                obj.position.set(5200+objData.position.x, 5200+objData.position.y, objData.position.z);
                obj.quaternion.set(objData.rotation.x, objData.rotation.y, objData.rotation.z, objData.rotation.w);
                obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                scene.add(obj);
              }

              for (var i = 0; i < ifoData.buildings.length; ++i) {
                var objData = ifoData.buildings[i];
                var obj = createZscObject(cnstData, objData.objectId);
                obj.position.set(5200+objData.position.x, 5200+objData.position.y, objData.position.z);
                obj.quaternion.set(objData.rotation.x, objData.rotation.y, objData.rotation.z, objData.rotation.w);
                obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                scene.add(obj);
              }
            });
            //*/
          });
        })(ix, iy);
      }
    }
  });
});

var moveObj = null;

//*/


var socket = io();
socket.emit('ping');
socket.on('pong', function (data) {
  console.log('pong');
});

//*
var charIdx = 2;
if (window.location.hash.length > 1) {
  charIdx = window.location.hash.substr(1);
}

function GroupLoader() {
  this.sources = [];
}
GroupLoader.prototype.add = function(name, loader, path) {
  this.sources.push([name, loader, path]);
};
GroupLoader.prototype.load = function(callback) {
  var self = this;
  var loadedObjs = {};
  var loadedCount = 0;
  function maybeDone() {
    if (loadedCount === self.sources.length) {
      callback(loadedObjs);
    }
  }
  for (var i = 0; i < self.sources.length; ++i) {
    (function(source) {
      var name = source[0];
      var loader = source[1];
      var path = source[2];
      loader.load(path, function(res) {
        loadedObjs[name] = res;
        loadedCount++;
        maybeDone();
      });
    })(self.sources[i]);
  }
};

var avatarGrp = new GroupLoader();
avatarGrp.add('male_skel', ZMDLoader, '3DDATA/AVATAR/MALE.ZMD');
avatarGrp.add('female_skel', ZMDLoader, '3DDATA/AVATAR/FEMALE.ZMD');
avatarGrp.add('male_face', ZSCLoader, '3DDATA/AVATAR/LIST_MFACE.ZSC');
avatarGrp.add('male_hair', ZSCLoader, '3DDATA/AVATAR/LIST_MHAIR.ZSC');
avatarGrp.add('male_body', ZSCLoader, '3DDATA/AVATAR/LIST_MBODY.ZSC');
avatarGrp.add('male_foot', ZSCLoader, '3DDATA/AVATAR/LIST_MFOOT.ZSC');
avatarGrp.add('male_arms', ZSCLoader, '3DDATA/AVATAR/LIST_MARMS.ZSC');
avatarGrp.load(function(loadedObjs) {
  var mskel = loadedObjs['male_skel'];
  var fskel = loadedObjs['female_skel'];
  var mface = loadedObjs['male_face'];
  var mhair = loadedObjs['male_hair'];
  var mbody = loadedObjs['male_body'];
  var mfoot = loadedObjs['male_foot'];
  var marms = loadedObjs['male_arms'];

  var charObj = new THREE.Object3D();
  charObj.position.set(5200, 5200, 40);
  charObj.rotation.z += Math.PI;
  charObj.scale.set(1.2,1.2,1.2);
  scene.add(charObj);
  moveObj = charObj;

  var charSkel = mskel.create(charObj);
  function addPart(zscData, modelIdx, bindBone) {
    var model = zscData.objects[modelIdx];

    for (var j = 0; j < model.parts.length; ++j) {
      (function(part) {
        var material = makeZscMaterial(zscData.materials[part.materialIdx]);

        var meshPath = zscData.meshes[part.meshIdx];
        ZMSLoader.load(meshPath, function (geometry) {
          if (bindBone === undefined) {
            var charPartMesh = new THREE.SkinnedMesh(geometry, material);
            charPartMesh.bind(charSkel);
            charObj.add(charPartMesh);
          } else {
            var charPartMesh = new THREE.Mesh(geometry, material);
            charSkel.bones[bindBone].add(charPartMesh);
          }
        });
      })(model.parts[j]);
    }
  }
  addPart(mhair, 1, 4);
  addPart(mface, 2, 4);
  addPart(mbody, 1);
  addPart(mfoot, 1);
  addPart(marms, 1);

  var animPath = '3DDATA/MOTION/AVATAR/EMPTY_RUN_M1.ZMO';
  ZMOLoader.load(animPath, function(zmoData) {
    var anim = zmoData.createForSkeleton('test', charObj, charSkel);
    anim.play();
  });

  //charObj.add(camera);
});

/*
var coreGrp = new GroupLoader();
coreGrp.add('list_npc_chr', CHRLoader, '3DDATA/NPC/LIST_NPC.CHR');
coreGrp.add('part_npc_zsc', ZSCLoader, '3DDATA/NPC/PART_NPC.ZSC');
coreGrp.load(function(loadedObjs) {
  var chrData = loadedObjs['list_npc_chr'];
  var zscData = loadedObjs['part_npc_zsc'];

  var char = chrData.characters[charIdx];
  if (char == null) {
    return;
  }

  var charObj = new THREE.Object3D();
  charObj.position.set(5200, 5200, 40);
  charObj.scale.set(10, 10, 10);
  scene.add(charObj);
  moveObj = charObj;

  var skelPath = chrData.skeletons[char.skeletonIdx];
  ZMDLoader.load(skelPath, function(zmdData) {
    var charSkel = zmdData.create(charObj);

    var charModels = char.models;
    for (var i = 0; i < charModels.length; ++i) {
      var model = zscData.objects[charModels[i]];

      for (var j = 0; j < model.parts.length; ++j) {
        (function(part) {
          var material = makeZscMaterial(zscData.materials[part.materialIdx]);

          var meshPath = zscData.meshes[part.meshIdx];
          ZMSLoader.load(meshPath, function (geometry) {
            var charPartMesh = new THREE.SkinnedMesh(geometry, material);
            charPartMesh.bind(charSkel);
            charObj.add(charPartMesh);
          });
        })(model.parts[j]);
      }
    }

    var animPath = chrData.animations[char.animations[0]];
    ZMOLoader.load(animPath, function(zmoData) {
      var anim = zmoData.createForSkeleton('test', charObj, charSkel);
      anim.play();
    });
  });

  setTimeout(function() {
 var ray = new THREE.Raycaster(new THREE.Vector3(5200, 5200, 200), new THREE.Vector3(0, 0, -1));
 var octreeObjects = worldTree.search( ray.ray.origin, ray.ray.far, true, ray.ray.direction );
 var inters = ray.intersectOctreeObjects( octreeObjects );
 if (inters.length > 0) {
 var p = inters[0].point;
 charObj.position.set(p.x, p.y, p.z);
 }
  }, 2000);

});
//*/

var moveTowards = new THREE.Vector2(5200, 5200);

//*
rendererEl.addEventListener('mousemove', function(e) {
  e.preventDefault();

  var mouse = new THREE.Vector3(0, 0, 0.5);
  mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  projector.unprojectVector( mouse, camera );

  var cameraPos = camera.localToWorld(new THREE.Vector3(0,0,0));
  var ray = new THREE.Raycaster(cameraPos, mouse.sub( cameraPos ).normalize());
  var octreeObjects = worldTree.search( ray.ray.origin, ray.ray.far, true, ray.ray.direction );
  var inters = ray.intersectOctreeObjects( octreeObjects );

  if (inters.length > 0) {
    var p = inters[0].point;
    moveTowards.set(p.x, p.y);
    //moveObj.position.set(p.x, p.y, p.z);
  }
}, false );

//*/

/*
var rootObj = new THREE.Object3D();
scene.add(rootObj);

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


      });
    });
  });
});
//*/
