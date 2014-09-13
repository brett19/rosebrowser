'use strict';

function TestState() {

}

TestState.prototype.prepare = function(callback) {
  callback();
};

TestState.prototype.test = function() {
  console.log('TEST!');
};

TestState.prototype.enter = function() {
  var self = this;

  debugGui.add(this, 'test');

  ModelList.load('3DDATA/JUNON/LIST_CNST_JPT.ZSC', function(cnstData) {
    ModelList.load('3DDATA/JUNON/LIST_DECO_JPT.ZSC', function (decoData) {
      var cnstMgr = new ModelListManager(cnstData);
      var decoMgr = new ModelListManager(decoData);

      for (var iy = 31; iy <= 32; ++iy) {
        for (var ix = 32; ix <= 32; ++ix) {
          (function (cx, cy) {
            var himPath = '3DDATA/MAPS/JUNON/TITLE_JPT/' + cx + '_' + cy + '.HIM';
            Heightmap.load(himPath, function (heightmap) {
              var geom = new THREE.Geometry();

              for (var vy = 0; vy < 65; ++vy) {
                for (var vx = 0; vx < 65; ++vx) {
                  geom.vertices.push(new THREE.Vector3(
                      vx * 2.5, vy * 2.5, heightmap.map[(64 - vy) * 65 + (vx)] * ZZ_SCALE_IN
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

              var chunkMesh = new THREE.Mesh(geom, defaultMat);
              chunkMesh.position.x = (cx - 32) * 160 - 80 + 5200;
              chunkMesh.position.y = (32 - cy) * 160 - 80 + 5200;
              scene.add(chunkMesh);

              if (true) {
                var ifoPath = '3DDATA/MAPS/JUNON/TITLE_JPT/' + cx + '_' + cy + '.IFO';
                MapInfo.load(ifoPath, function(ifoData) {
                  for (var i = 0; i < ifoData.objects.length; ++i) {
                    var objData = ifoData.objects[i];
                    var obj = decoMgr.createForStatic(objData.objectId);
                    obj.position.set(5200+objData.position.x, 5200+objData.position.y, objData.position.z);
                    obj.quaternion.set(objData.rotation.x, objData.rotation.y, objData.rotation.z, objData.rotation.w);
                    obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                    scene.add(obj);
                  }

                  for (var i = 0; i < ifoData.buildings.length; ++i) {
                    var objData = ifoData.buildings[i];
                    var obj = cnstMgr.createForStatic(objData.objectId);
                    //var obj = createZscObject(cnstData, objData.objectId);
                    obj.position.set(5200+objData.position.x, 5200+objData.position.y, objData.position.z);
                    obj.quaternion.set(objData.rotation.x, objData.rotation.y, objData.rotation.z, objData.rotation.w);
                    obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                    scene.add(obj);
                  }
                });
              }
            });
          })(ix, iy);
        }
      }
    });
  });

  var animPath = '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO';
  Animation.load(animPath, function(zmoData) {
    self.cameraAnimator = new ZMOCameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    self.cameraAnimator.play(-1);
  });
};

TestState.prototype.leave = function() {

};

TestState.prototype.update = function(delta) {
  if (this.cameraAnimator) {
    this.cameraAnimator.update(delta);
  }
};
