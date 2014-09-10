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

THREE.XHRLoader.prototype.crossOrigin = 'anonymous';

var cube = null;
var skhp = null;

var ddsLoader = new THREE.DDSLoader();

var map1 = ddsLoader.load( "http://home.br19.com:82/rosedata/3DDATA/NPC/PLANT/JELLYBEAN1/BODY02.DDS" );
map1.minFilter = map1.magFilter = THREE.LinearFilter;
//map1.anisotropy = 4;
//var material1 = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, map: map1 } );
var material1 = new THREE.MeshBasicMaterial({color: 0xdddddd, map: map1});
material1.skinning = true;

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

var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
  i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
  k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
      "block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:11,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
      a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var clock = new THREE.Clock();
var render = function () {
  requestAnimationFrame(render);

  var delta = clock.getDelta();
  THREE.AnimationHandler.update( delta );

  if (cube) {

  }

  if (skhp) {
    skhp.update();
  }

  renderer.render(scene, camera);
  stats.update();
};

render();

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

var loader = new THREE.XHRLoader();
loader.setResponseType('arraybuffer');
loader.load("http://home.br19.com:82/rosedata/3DDATA/NPC/PLANT/JELLYBEAN1/BODY02.ZMS", function (buffer) {
  var rh = new BinaryReader(buffer);

  var geometry = new THREE.Geometry();

  rh.skip(8);
  var format = rh.readUint32();
  var bbMinX = rh.readVector3();
  var bbMaxX = rh.readVector3();


  var boneCount = rh.readUint16();
  var boneTable = [];
  for (var i = 0; i < boneCount; ++i) {
    boneTable[i] = rh.readUint16();
  }

  var vertexCount = rh.readUint16();
  var vertexUvs = [[], [], [], []];

  var bbMin = new THREE.Vector3(+100000, +100000, +100000);
  var bbMax = new THREE.Vector3(-100000, -100000, -100000);

  for (var i = 0; i < vertexCount; ++i) {
    var v = rh.readVector3();
    if (v.x < bbMin.x) bbMin.x = v.x;
    if (v.y < bbMin.y) bbMin.y = v.y;
    if (v.z < bbMin.z) bbMin.z = v.z;
    if (v.x > bbMax.x) bbMax.x = v.x;
    if (v.y > bbMax.y) bbMax.y = v.y;
    if (v.z > bbMax.z) bbMax.z = v.z;
    geometry.vertices.push(v);
  }
  console.log(bbMin, bbMax);
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

    var uv = [vertexUvs[0][v1], vertexUvs[0][v2], vertexUvs[0][v3]];
    geometry.faceVertexUvs[0].push(uv);
  }

  var loaderx = new THREE.XHRLoader();
  loaderx.setResponseType('arraybuffer');
  loaderx.load("http://home.br19.com:82/rosedata/3DDATA/NPC/PLANT/JELLYBEAN1/JELLYBEAN2_BONE.ZMD", function (bufferx) {
    var rhx = new BinaryReader(bufferx);

    rhx.skip(7);

    var bones = [];
    var boneCount = rhx.readUint32();
    for (var i = 0; i < boneCount; ++i) {
      var bone = {};
      bone.parent = rhx.readUint32();
      bone.name = rhx.readStr();
      var bonePos = rhx.readVector3().divideScalar(100);
      bone.pos = [bonePos.x, bonePos.y, bonePos.z];
      var boneRot = rhx.readBadQuat();
      bone.rotq = [boneRot.x, boneRot.y, boneRot.z, boneRot.w];

      if (i == 0) {
        bone.parent = -1;
      }
      bones.push(bone);
    }
    geometry.bones = bones;

    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeTangents();

    cube = new THREE.SkinnedMesh(geometry, material1, false);
    scene.add(cube);

    var ZMOCTYPE = {
      None: 1 << 0,
      Position: 1 << 1,
      Rotation: 1 << 2
    };

    var loadery = new THREE.XHRLoader();
    loadery.setResponseType('arraybuffer');
    loadery.load("http://home.br19.com:82/rosedata/3DDATA/MOTION/NPC/JELLYBEAN1/JELLYBEAN1_WALK.ZMO", function (buffery) {
      var rhy = new BinaryReader(buffery);

      rhy.skip(8);

      var framesPerSecond = rhy.readUint32();
      var frameCount = rhy.readUint32();
      var channelCount = rhy.readUint32();

      var animD = {
        name: 'test',
        fps: framesPerSecond,
        length: frameCount / framesPerSecond,
        hierarchy: []
      };
      for (var i = 0; i < boneCount; ++i) {
        var animT = {
          parent: i,
          keys: []
        };
        for (var j = 0; j < frameCount; ++j) {
          animT.keys.push({time: j/framesPerSecond, pos: bones[i].pos, rot: bones[i].rotq, scl: [1, 1, 1]});
        }
        animD.hierarchy.push(animT);
      }

      var channelData = [];
      for (var i = 0; i < channelCount; ++i) {
        var channelType = rhy.readUint32();
        var channelIndex = rhy.readUint32();
        channelData.push({type: channelType, index: channelIndex});
      }

      for (var i = 0; i < frameCount; ++i) {
        for (var j = 0; j < channelCount; ++j) {
          var thisKey = animD.hierarchy[channelData[j].index].keys[i];
          if (channelData[j].type == ZMOCTYPE.Position) {
            var newPos = rhy.readVector3().divideScalar(100);
            thisKey.pos = [newPos.x, newPos.y, newPos.z];
          } else if (channelData[j].type == ZMOCTYPE.Rotation) {
            var newRot = rhy.readBadQuat();
            thisKey.rot = [newRot.x, newRot.y, newRot.z, newRot.w];
          }
        }
      }

      var anim = new THREE.Animation(cube, animD);
      anim.play();


      skhp = new THREE.SkeletonHelper(cube);
      skhp.update();
      scene.add(skhp);

      //cube.add( new THREE.FaceNormalsHelper( cube, 0.06 ) );
      //scene.add( new THREE.VertexNormalsHelper( cube, 0.06 ) );
    });
  });

});
