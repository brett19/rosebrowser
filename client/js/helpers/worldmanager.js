'use strict';

var _TMPMAPLIST = [
  {
    zoneDataPath: '3DDATA/MAPS/JUNON/TITLE_JPT/TITLE_JPT.ZON',
    cnstModelListPath: '3DDATA/JUNON/LIST_CNST_JPT.ZSC',
    decoModelListPath: '3DDATA/JUNON/LIST_DECO_JPT.ZSC',
    chunkBounds: [[32, 32], [31, 32]]
  }
];

function WorldManager() {
  this.rootObj = new THREE.Object3D();
  this.cnstModelMgr = null;
  this.decoModelMgr = null;
  this.basePath = null;
}

WorldManager.prototype._loadChunkTerrain = function(chunkX, chunkY, callback) {
  var himPath = this.basePath + chunkX + '_' + chunkY + '.HIM';
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
        var uv1 = new THREE.Vector2((fx + 0) / 4, (fy + 0) / 4);
        var uv2 = new THREE.Vector2((fx + 1) / 4, (fy + 0) / 4);
        var uv3 = new THREE.Vector2((fx + 0) / 4, (fy + 1) / 4);
        var uv4 = new THREE.Vector2((fx + 1) / 4, (fy + 1) / 4);
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

    callback(geom);
  });
};

WorldManager.prototype._loadChunkObjectGroup = function(objList, modelList) {
  for (var i = 0; i < objList.length; ++i) {
    var objData = objList[i];
    var obj = modelList.createForStatic(objData.objectId);
    obj.position.copy(objData.position);
    obj.quaternion.copy(objData.rotation);
    obj.scale.copy(objData.scale);
    this.rootObj.add(obj);
  }
};

WorldManager.prototype._loadChunkObjects = function(chunkX, chunkY, callback) {
  var self = this;
  var ifoPath = this.basePath + chunkX + '_' + chunkY + '.IFO';
  MapInfo.load(ifoPath, function(ifoData) {
    self._loadChunkObjectGroup(ifoData.objects, self.decoModelMgr);
    self._loadChunkObjectGroup(ifoData.buildings, self.cnstModelMgr);

    if (callback) {
      callback();
    }
  });
};

WorldManager.prototype._loadChunk = function(chunkX, chunkY, callback) {
  var self = this;
  this._loadChunkTerrain(chunkX, chunkY, function(geom) {
    var chunkMesh = new THREE.Mesh(geom, defaultMat);
    chunkMesh.position.x = (chunkX - 32) * 160 - 80;
    chunkMesh.position.y = (32 - chunkY) * 160 - 80;
    self.rootObj.add(chunkMesh);

    if (callback) {
      callback();
    }
  });
  this._loadChunkObjects(chunkX, chunkY);
};

WorldManager.prototype.setMap = function(mapIdx, callback) {
  var self = this;
  var mapData = _TMPMAPLIST[mapIdx];

  var lastPathSlash = mapData.zoneDataPath.lastIndexOf('/');
  this.basePath = mapData.zoneDataPath.substr(0, lastPathSlash + 1);

  ModelList.load(mapData.cnstModelListPath, function(cnstData) {
    ModelList.load(mapData.decoModelListPath, function (decoData) {
      self.cnstModelMgr = new ModelListManager(cnstData);
      self.decoModelMgr = new ModelListManager(decoData);

      var chunkSX = mapData.chunkBounds[0][0];
      var chunkEX = mapData.chunkBounds[0][1];
      var chunkSY = mapData.chunkBounds[1][0];
      var chunkEY = mapData.chunkBounds[1][1];

      for (var iy = chunkSY; iy <= chunkEY; ++iy) {
        for (var ix = chunkSX; ix <= chunkEX; ++ix) {
          self._loadChunk(ix, iy);
        }
      }
    });
  });
};

