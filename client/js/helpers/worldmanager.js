'use strict';

// TODO: Do something with ZONE_TABLE, maybe even $.extend(DataTable)
var ZONE_TABLE = {
  NAME: 0, // STR
  FILE: 1, // STR
  START_POS: 2, // STR
  REVIVE_POS: 3, // STR
  IS_UNDERGROUND: 4, // INT
  BG_MUSIC_DAY: 5, // STR
  BG_MUSIC_NIGHT: 6, // STR
  BG_IMAGE: 7, // INT
  MINIMAP_NAME: 8, // STR
  MINIMAP_STARTX: 9, // INT
  MINIMAP_STARTY: 10, // INT
  OBJECT_TABLE: 11, // STR
  CNST_TABLE: 12, // STR
  DAY_CYCLE: 13, // INT
  MORNING_TIME: 14, // INT
  DAY_TIME: 15, // INT
  EVENING_TIME: 16, // INT
  NIGHT_TIME: 17, // INT
  PVP_STATE: 18, // INT
  PLANET_NO: 19, // INT
  TYPE: 20, // INT
  CAMERA_TYPE: 21, // INT
  JOIN_TRIGGER: 22, // STR
  KILL_TRIGGER: 23, // STR
  DEAD_TRIGGER: 24, // STR
  SECTOR_SIZE: 25, // INT
  STRING_ID: 26, // STR
  WEATHER_TYPE: 27, // INT
  PARTY_EXP_A: 28, // INT
  PARTY_EXP_B: 29, // INT
  RIDING_REFUSE_FLAG: 30, // INT
  REVIVE_ZONENO: 31, // INT
  REVIVE_X_POS: 32, // INT
  REVIVE_Y_POS: 33 // INT
};

function WorldManager() {
  this.rootObj = new THREE.Object3D();
  this.octree = new THREE.Octree({
    depthMax: Infinity,
    objectsThreshold: 8,
    overlapPct: 0.15,
    undeferred: true
  });
  this.cnstModelMgr = null;
  this.decoModelMgr = null;
  this.basePath = null;
  this.textures = [];
  this.texturePaths = [];
  this.matLookup = [];
  this.terChunks = [];
  this.objects = [];
  this.DM = new DataManager();
  this.shaderMaterial = new THREE.ShaderMaterial({
    attributes: {uv3:{}},
    uniforms: [],
    vertexShader:   document.getElementById( 'terrainVertexShader' ).textContent,
    fragmentShader: document.getElementById( 'terrainFragmentShader' ).textContent
  });
}

WorldManager.prototype.addToScene = function() {
  scene.add(this.rootObj);
  this.rootObj.updateMatrixWorld(true);
};

WorldManager.prototype.removeFromScene = function() {
  scene.remove(this.rootObj);
};

WorldManager.prototype._createMaterial = function(texId1, texId2, blockIdx, lmTex) {
  var self = this;

  if (self.matLookup[blockIdx]) {
    if (self.matLookup[blockIdx][texId1]) {
      if (self.matLookup[blockIdx][texId1][texId2]) {
        return self.matLookup[blockIdx][texId1][texId2];
      }
    }
  }

  if (!self.textures[texId1]) {
    self.textures[texId1] = RoseTextureManager.load(self.texturePaths[texId1]);
  }
  var tex1 = self.textures[texId1];
  if (!self.textures[texId2]) {
    self.textures[texId2] = RoseTextureManager.load(self.texturePaths[texId2]);
  }
  var tex2 = self.textures[texId2];

  var newMaterial = self.shaderMaterial.clone();
  newMaterial.texId1 = texId1;
  newMaterial.texId2 = texId2;
  newMaterial.uniforms = {
    texture1: { type: 't', value: tex1 },
    texture2: { type: 't', value: tex2 },
    texture3: { type: 't', value: lmTex }
  };

  if (!self.matLookup[blockIdx]) {
    self.matLookup[blockIdx] = [];
  }
  if (!self.matLookup[blockIdx][texId1]) {
    self.matLookup[blockIdx][texId1] = [];
  }
  self.matLookup[blockIdx][texId1][texId2] = newMaterial;
  return newMaterial;
};

WorldManager.prototype._rotateUV = function(tile, uv) {
  switch(tile.rotation) {
    case Zone.TILE_ROTATION.FLIP_HORIZONTAL:
      uv.x = 1.0 - uv.x;
      break;
    case Zone.TILE_ROTATION.FLIP_VERTICAL:
      uv.y = 1.0 - uv.y;
      break;
    case Zone.TILE_ROTATION.FLIP_BOTH:
      uv.x = 1.0 - uv.x;
      uv.y = 1.0 - uv.y;
      break;
    case Zone.TILE_ROTATION.CLOCKWISE_90:
      var tmp = uv.x;
      uv.x = uv.y;
      uv.y = tmp;
      break;
    case Zone.TILE_ROTATION.COUNTER_CLOCKWISE_90:
      var tmp = uv.x;
      uv.x = uv.y;
      uv.y = 1.0 - tmp;
      break;
  }
  return uv;
};

WorldManager.prototype._addTileMaterial = function(geom, tile) {
  var self = this;

  var texId1 = tile.layer1 + tile.offset1;
  var texId2 = tile.layer2 + tile.offset2;

  var mat = self._createMaterial(texId1, texId2);
  geom.materials.push(mat);
  return geom.materials.length - 1;
}

WorldManager.prototype._buildChunkTerarin = function(chunkX, chunkY, blockX, blockY, tilemap, heightmap, blockIdx, verts, indices, uv0, uv1, uv2) {
  var tileIdx = (15-blockY) * 16 + blockX;
  var tile = this.zoneInfo.tiles[tilemap.map[tileIdx].number];

  var vertBase = blockIdx * 5 * 5;
  var indexBase = blockIdx * 4 * 4;

  for (var vy = 0; vy < 5; ++vy) {
    for (var vx = 0; vx < 5; ++vx) {
      var vertIdx = vertBase + (vy * 5 + vx);
      var vertX = blockX * 4 + vx;
      var vertY = 64 - (blockY * 4 + vy);
      verts[vertIdx*3+0] = (blockX * 10) + (vx * 2.5);
      verts[vertIdx*3+1] = (blockY * 10) + (vy * 2.5);
      verts[vertIdx*3+2] = heightmap.map[vertY * 65 + vertX] * ZZ_SCALE_IN;
      uv0[vertIdx*2+0] = (vx / 5);
      uv0[vertIdx*2+1] = 1- (vy / 5);
      var tex2Uv = this._rotateUV(tile, {x:vx/5,y:vy/5});
      uv1[vertIdx*2+0] = tex2Uv.x;
      uv1[vertIdx*2+1] = 1 - tex2Uv.y;
      uv2[vertIdx*2+0] = (vertX / 64);
      uv2[vertIdx*2+1] = (vertY / 64);
    }
  }

  for (var fy = 0; fy < 4; ++fy) {
    for (var fx = 0; fx < 4; ++fx) {
      var v1 = vertBase + (fy + 0) * 5 + (fx + 0);
      var v2 = vertBase + (fy + 0) * 5 + (fx + 1);
      var v3 = vertBase + (fy + 1) * 5 + (fx + 0);
      var v4 = vertBase + (fy + 1) * 5 + (fx + 1);

      var faceIdx = indexBase + (fy * 4 + fx);
      indices[faceIdx*6+0] = v1;
      indices[faceIdx*6+1] = v2;
      indices[faceIdx*6+2] = v3;
      indices[faceIdx*6+3] = v4;
      indices[faceIdx*6+4] = v3;
      indices[faceIdx*6+5] = v2;
    }
  }
};

WorldManager.prototype._loadChunkTerrain = function(chunkX, chunkY, callback) {
  var himPath = this.basePath + chunkX + '_' + chunkY + '.HIM';
  var tilPath = this.basePath + chunkX + '_' + chunkY + '.TIL';
  var ddsPath = this.basePath + chunkX + '_' + chunkY + '/' + chunkX + '_' + chunkY + '_PLANELIGHTINGMAP.DDS';
  var self = this;

  var lightmap = RoseTextureManager.load(ddsPath);

  Tilemap.load(tilPath, function(tilemap) {
    Heightmap.load(himPath, function (heightmap) {
      var chunkGrps = [];
      function findChunkGrp(tile) {
        var texId1 = tile.layer1 + tile.offset1;
        var texId2 = tile.layer2 + tile.offset2;
        for (var i = 0; i < chunkGrps.length; ++i) {
          var chunkGrp = chunkGrps[i];
          if (chunkGrp.texId1 === texId1 && chunkGrp.texId2 === texId2) {
            return chunkGrp;
          }
        }
        var newChunkGrp = {
          texId1: texId1,
          texId2: texId2,
          blocks: []
        };
        chunkGrps.push(newChunkGrp);
        return newChunkGrp;
      }

      for (var by = 0; by < 16; ++by) {
        for (var bx = 0; bx < 16; ++bx) {
          var tileIdx = (15-by) * 16 + bx;
          var tile = self.zoneInfo.tiles[tilemap.map[tileIdx].number];
          var chunkGrp = findChunkGrp(tile);
          chunkGrp.blocks.push([bx, by]);
        }
      }

      for (var i = 0; i < chunkGrps.length; ++i) {
        var chunkGrp = chunkGrps[i];

        var blockCount = chunkGrp.blocks.length;
        var verts = new Float32Array(blockCount * 5*5*3);
        var indices = new Uint16Array(blockCount * 4*4*2*3);
        var uv0 = new Float32Array(blockCount * 5*5*2);
        var uv1 = new Float32Array(blockCount * 5*5*2);
        var uv2 = new Float32Array(blockCount * 5*5*2);

        for (var j = 0; j < chunkGrp.blocks.length; ++j) {
          var blockX = chunkGrp.blocks[j][0];
          var blockY = chunkGrp.blocks[j][1];
          self._buildChunkTerarin(chunkX, chunkY, blockX, blockY, tilemap, heightmap, j, verts, indices, uv0, uv1, uv2)
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(verts, 3));
        geometry.addAttribute('index', new THREE.BufferAttribute(indices, 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(uv0, 2));
        geometry.addAttribute('uv2', new THREE.BufferAttribute(uv1, 2));
        geometry.addAttribute('uv3', new THREE.BufferAttribute(uv2, 2));

        geometry.dynamic = false;
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        var chunkGrpMat = self._createMaterial(chunkGrp.texId1, chunkGrp.texId2, chunkY*64+chunkX, lightmap);
        var chunkMesh = new THREE.Mesh(geometry, chunkGrpMat);
        chunkMesh.name = 'TER_' + chunkX + '_' + chunkY + '_' + i;
        chunkMesh.position.x = (chunkX - 32) * 160 - 80;
        chunkMesh.position.y = (32 - chunkY) * 160 - 80;
        chunkMesh.updateMatrix();
        chunkMesh.matrixAutoUpdate = false;
        self.rootObj.add(chunkMesh);
        //self.octree.add(chunkMesh);
        self.terChunks.push(chunkMesh);
      }

      callback();
    });
  });
};

WorldManager.prototype._loadChunkObjectGroup = function(namePrefix, objList, modelList, lightmap, callback) {
  if (objList.length === 0) {
    callback();
    return;
  }

  var objectsLeft = objList.length;
  function oneObjectDone() {
    objectsLeft--;
    if (objectsLeft === 0) {
      if (callback) {
        callback();
      }
    }
  }
  for (var i = 0; i < objList.length; ++i) {
    var objData = objList[i];
    var obj = modelList.createForStatic(objData.objectId, oneObjectDone);
    obj.name = namePrefix + '_' + i;
    obj.position.copy(objData.position);
    obj.quaternion.copy(objData.rotation);
    obj.scale.copy(objData.scale);
    obj.updateMatrix();
    obj.matrixAutoUpdate = false;
    this.rootObj.add(obj);
    //this.octree.add(obj);
    this.objects.push(obj);
  }
};

WorldManager.prototype._loadChunkObjects = function(chunkX, chunkY, callback) {
  var self = this;
  var ifoPath = this.basePath + chunkX + '_' + chunkY + '.IFO';
  var litCnstPath = this.basePath + chunkX + '_' + chunkY + '/LIGHTMAP/BUILDINGLIGHTMAPDATA.LIT';
  var litDecoPath = this.basePath + chunkX + '_' + chunkY + '/LIGHTMAP/OBJECTLIGHTMAPDATA.LIT';

  Lightmap.load(litCnstPath, function(cnstLightmap) {
    Lightmap.load(litDecoPath, function (decoLightmap) {
      MapInfo.load(ifoPath, function (ifoData) {
        var groupsLeft = 2;
        function oneGroupDone() {
          groupsLeft--;
          if (groupsLeft === 0) {
            if (callback) {
              callback();
            }
          }
        }
        self._loadChunkObjectGroup('DECO_' + chunkX + '_' + chunkY, ifoData.objects, self.decoModelMgr, decoLightmap, oneGroupDone);
        self._loadChunkObjectGroup('CNST_' + chunkX + '_' + chunkY, ifoData.buildings, self.cnstModelMgr, cnstLightmap, oneGroupDone);
      });
    });
  });
};

WorldManager.prototype._loadChunk = function(chunkX, chunkY, callback) {
  var self = this;

  var itemsLeft = 2;
  function oneItemDone() {
    itemsLeft--;
    if (itemsLeft === 0) {
      if (callback) {
        callback();
      }
    }
  }
  this._loadChunkTerrain(chunkX, chunkY, oneItemDone);
  this._loadChunkObjects(chunkX, chunkY, oneItemDone);
};

WorldManager.prototype.findHighPoint = function(x, y) {
  var caster = new THREE.Raycaster(new THREE.Vector3(x, y, 200), new THREE.Vector3(0, 0, -1));
  //var octreeObjects = this.octree.search( caster.ray.origin, caster.ray.far, true, caster.ray.direction );
  //var inters = caster.intersectOctreeObjects( octreeObjects );
  var inters = caster.intersectObjects( this.terChunks );
  if (inters.length > 0) {
    return inters[0].point.z;
  }
};

WorldManager.prototype.setMap = function(mapIdx, callback) {
  var self = this;
  self.textures = [];

  GDM.get('list_zone', function (zoneTable) {
    var mapRow = zoneTable.rows[mapIdx];

    self.DM.register('cnstmdls', ModelListManager, mapRow[ZONE_TABLE.CNST_TABLE]);
    self.DM.register('decomdls', ModelListManager, mapRow[ZONE_TABLE.OBJECT_TABLE]);
    self.DM.register('zoneinfo', Zone, mapRow[ZONE_TABLE.FILE]);
    self.DM.get('zoneinfo', 'cnstmdls', 'decomdls',
        function(zone, cnstMdls, decoMdls) {
      var lastPathSlash = mapRow[ZONE_TABLE.FILE].lastIndexOf('\\');
      self.basePath = mapRow[ZONE_TABLE.FILE].substr(0, lastPathSlash + 1);

      // TODO: Cleanup MAP_BOUNDS, this is nasty. Probably can use REGEX for clean
      var boundsName = self.basePath.toUpperCase();
      boundsName = boundsName.substr("3DDATA\\MAPS\\".length);
      boundsName = boundsName.substr(0, boundsName.length - 1);
      boundsName = boundsName.replace('\\', '/');
      var chunkBounds = MAP_BOUNDS[boundsName];

      self.zoneInfo = zone;

      for (var i = 0; i < zone.textures.length; ++i) {
        // Why ROSE, why?
        if (zone.textures[i] === 'end') {
          break;
        }

        self.texturePaths.push(zone.textures[i]);
        self.textures.push(null);
      }

      self.cnstModelMgr = cnstMdls;
      self.decoModelMgr = decoMdls;

      var chunkSX = chunkBounds[0][0];
      var chunkEX = chunkBounds[0][1];
      var chunkSY = chunkBounds[1][0];
      var chunkEY = chunkBounds[1][1];

      // Start at 1 so if the first chunk instant-loads, it does not
      //   cause it to call done multiple times.
      var chunksLeft = 1;
      function doneLoadChunk() {
        chunksLeft--;
        if (chunksLeft === 0) {
          //self.octree.update();
          callback();
        }
      }
      for (var iy = chunkSY; iy <= chunkEY; ++iy) {
        for (var ix = chunkSX; ix <= chunkEX; ++ix) {
          chunksLeft++;
          self._loadChunk(ix, iy, doneLoadChunk);
        }
      }
      chunksLeft--;
    });
  });
};
