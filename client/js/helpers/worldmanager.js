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

function tileRotateUvs(tile, uv) {
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
}


function WorldManager() {
  this.rootObj = new THREE.Object3D();
  this.octree = new THREE.Octree({
    depthMax: Infinity,
    objectsThreshold: 8,
    overlapPct: 0.15,
    undeferred: true
  });
  this.isLoaded = false;
  this.cnstModelMgr = null;
  this.decoModelMgr = null;
  this.basePath = null;
  this.chunks = {};
  this.terChunks = [];
  this.objects = [];
  this.zoneInfo = null;
  this.viewDistSq = Math.pow(300, 2);
  this.DM = new DataManager();
}

WorldManager.baseShaderMaterial = null;
WorldManager.getBaseShaderMaterial = function() {
  if (!WorldManager.baseShaderMaterial) {
    var shaderMaterial = new THREE.ShaderMaterial({
      attributes: {uv3:{}},
      uniforms: [],
      vertexShader:   document.getElementById( 'terrainVertexShader' ).textContent,
      fragmentShader: document.getElementById( 'terrainFragmentShader' ).textContent
    });
    WorldManager.baseShaderMaterial = shaderMaterial;
  }
  return WorldManager.baseShaderMaterial;
};

WorldManager.baseLmOnlyShaderMaterial = null;
WorldManager.getBaseLmOnlyShaderMaterial = function() {
  if (!WorldManager.baseLmOnlyShaderMaterial) {
    var shaderMaterial = new THREE.ShaderMaterial({
      attributes: {uv3:{}},
      uniforms: [],
      vertexShader:   document.getElementById( 'terrainVertexShader' ).textContent,
      fragmentShader: document.getElementById( 'terrainLMOnlyFragmentShader' ).textContent
    });
    WorldManager.baseLmOnlyShaderMaterial = shaderMaterial;
  }
  return WorldManager.baseLmOnlyShaderMaterial;
};

WorldManager.prototype.addToScene = function() {
  scene.add(this.rootObj);
  this.rootObj.updateMatrixWorld(true);
};

WorldManager.prototype.removeFromScene = function() {
  scene.remove(this.rootObj);
};

WorldManager.prototype.findHighPoint = function(x, y) {
  var caster = new THREE.Raycaster(new THREE.Vector3(x, y, 1000), new THREE.Vector3(0, 0, -1));
  //var octreeObjects = this.octree.search( caster.ray.origin, caster.ray.far, true, caster.ray.direction );
  //var inters = caster.intersectOctreeObjects( octreeObjects );
  var inters = caster.intersectObjects( this.terChunks );
  if (inters.length > 0) {
    return inters[0].point.z;
  }
};

function getMapBounds(mapBasePath) {
  var boundsName = mapBasePath.toUpperCase();
  boundsName = boundsName.substr("3DDATA\\MAPS\\".length);
  boundsName = boundsName.substr(0, boundsName.length - 1);
  boundsName = boundsName.replace('\\', '/');
  return MAP_BOUNDS[boundsName];
}
WorldManager.prototype.setMap = function(mapIdx, callback) {
  var self = this;
  self.textures = [];

  GDM.get('list_zone', function (zoneTable) {
    var mapRow = zoneTable.rows[mapIdx];

    self.DM.register('cnstmdls', ModelListManager, mapRow[ZONE_TABLE.CNST_TABLE]);
    self.DM.register('decomdls', ModelListManager, mapRow[ZONE_TABLE.OBJECT_TABLE]);
    self.DM.register('zoneinfo', Zone, mapRow[ZONE_TABLE.FILE]);
    self.DM.get('zoneinfo', 'cnstmdls', 'decomdls',  function(zone, cnstMdls, decoMdls) {
      var lastPathSlash = mapRow[ZONE_TABLE.FILE].lastIndexOf('\\');
      self.basePath = mapRow[ZONE_TABLE.FILE].substr(0, lastPathSlash + 1);
      self.zoneInfo = zone;
      self.cnstModelMgr = cnstMdls;
      self.decoModelMgr = decoMdls;

      var chunkBounds = getMapBounds(self.basePath);
      var chunkSX = chunkBounds[0][0];
      var chunkEX = chunkBounds[0][1];
      var chunkSY = chunkBounds[1][0];
      var chunkEY = chunkBounds[1][1];

      for (var iy = chunkSY; iy <= chunkEY; ++iy) {
        for (var ix = chunkSX; ix <= chunkEX; ++ix) {
          // ROSE uses 64, mind as well use 100 so its easier to read...
          self.chunks[ix*100+iy] = new WorldChunk(self, ix, iy);
        }
      }

      self.isLoaded = true;
      callback();
    });
  });
};

/**
 * Causes the world to update which chunks need to be visible for this
 * particular camera/player position.
 *
 * @param pos The position of the viewer, or null to load the whole map
 * @param callback Callback to invoke when all close chunks are loaded
 */
WorldManager.prototype.setViewerInfo = function(pos, callback) {
  if (!this.isLoaded) {
    console.warn('Attempted to load chunks before map was finished loading.');
    callback();
    return;
  }

  // TODO: Fix this, this is dumb.
  var localViewPos = pos.clone().sub(this.rootObj.position);

  var waitAll = new MultiWait();
  for (var chunkIdx in this.chunks) {
    if (this.chunks.hasOwnProperty(chunkIdx)) {
      var chunk = this.chunks[chunkIdx];
      var chunkDelta = localViewPos.clone().sub(chunk.position);
      chunkDelta.z = 0; // We don't care about the Z distance for here
      if (chunkDelta.lengthSq() <= this.viewDistSq) {
        chunk.load(waitAll.one());
      } else {
        chunk.markNotNeeded();
      }
    }
  }
  waitAll.wait(callback);
};

function WorldChunk(world, chunkX, chunkY) {
  this.world = world;
  this.name = chunkX + '_' + chunkY;
  this.chunkX = chunkX;
  this.chunkY = chunkY;
  this.textures = {};
  this.lightmapTex = null;
  this.heightmap = null;
  this.tilemap = null;
  this.position = new THREE.Vector3((chunkX - 33) * 160, (32 - chunkY) * 160, 0);
  this.isVisible = false;
  this.loadState = 0;
  this.loadWaiters = [];
  this.rootObj = new THREE.Object3D();
}

WorldChunk.prototype._getBlockTile = function(blockX, blockY) {
  var tileIdx = (15-blockY) * 16 + blockX;
  return this.world.zoneInfo.tiles[this.tilemap.map[tileIdx].number];
};

WorldChunk.prototype._createLmOnlyMaterial = function() {
  var newMaterial = WorldManager.getBaseLmOnlyShaderMaterial().clone();
  newMaterial.uniforms = {
    texture1: {type: 't', value: this.lightmapTex}
  };
  return newMaterial;
};

// We don't need to cache the materials here as they are generated on a
//   per-chunk basis.  Additionally, the mesh generator groups all blocks
//   using the same tiles to the same mesh, so this function only is called
//   once.
WorldChunk.prototype._createMaterial = function(texId1, texId2) {
  if (!this.textures[texId1]) {
    this.textures[texId1] = RoseTextureManager.load(this.world.zoneInfo.textures[texId1]);
  }
  var tex1 = this.textures[texId1];

  if (!this.textures[texId2]) {
    this.textures[texId2] = RoseTextureManager.load(this.world.zoneInfo.textures[texId2]);
  }
  var tex2 = this.textures[texId2];

  var newMaterial = WorldManager.getBaseShaderMaterial().clone();
  newMaterial.texId1 = texId1;
  newMaterial.texId2 = texId2;
  newMaterial.uniforms = {
    texture1: { type: 't', value: tex1 },
    texture2: { type: 't', value: tex2 },
    texture3: { type: 't', value: this.lightmapTex }
  };

  return newMaterial;
};

WorldChunk.prototype._buildTerrainBlock = function(blockX, blockY, bgbIdx, verts, indices, uv0, uv1, uv2) {
  var tile = this._getBlockTile(blockX, blockY);

  var vertBase = bgbIdx * 5 * 5;
  var indexBase = bgbIdx * 4 * 4;

  for (var vy = 0; vy < 5; ++vy) {
    for (var vx = 0; vx < 5; ++vx) {
      var vertIdx = vertBase + (vy * 5 + vx);
      var vertX = blockX * 4 + vx;
      var vertY = 64 - (blockY * 4 + vy);
      verts[vertIdx*3+0] = (blockX * 10) + (vx * 2.5);
      verts[vertIdx*3+1] = (blockY * 10) + (vy * 2.5);
      verts[vertIdx*3+2] = this.heightmap.map[vertY * 65 + vertX] * ZZ_SCALE_IN;
      uv0[vertIdx*2+0] = (vx / 5);
      uv0[vertIdx*2+1] = 1- (vy / 5);
      var tex2Uv = tileRotateUvs(tile, {x:vx/5,y:vy/5});
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

WorldChunk.prototype._buildTerrain = function() {
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
      var tile = this._getBlockTile(bx, by);
      var chunkGrp = findChunkGrp(tile);
      chunkGrp.blocks.push({x:bx,y:by});
    }
  }

  var materialOverride = null;
  if (config.lmonly) {
    materialOverride = this._createLmOnlyMaterial();
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
      var block = chunkGrp.blocks[j];
      this._buildTerrainBlock(block.x, block.y, j, verts, indices, uv0, uv1, uv2);
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

    var chunkGrpMat = materialOverride;
    if (!materialOverride) {
      chunkGrpMat = this._createMaterial(chunkGrp.texId1, chunkGrp.texId2);
    }

    var chunkMesh = new THREE.Mesh(geometry, chunkGrpMat);
    chunkMesh.name = 'TER_' + this.name + '_' + i;
    chunkMesh.position.copy(
        this.position.clone().add(new THREE.Vector3(80, -80, 0)));
    chunkMesh.updateMatrix();
    chunkMesh.matrixAutoUpdate = false;
    this.rootObj.add(chunkMesh);
    //self.world.octree.add(chunkMesh);
    this.world.terChunks.push(chunkMesh);

    var ah = new THREE.AxisHelper(20);
    ah.position.copy(this.position);
    this.rootObj.add(ah);
  }
};

WorldChunk.prototype._loadTerrain = function(callback) {
  var himPath = this.world.basePath + this.name + '.HIM';
  var tilPath = this.world.basePath + this.name + '.TIL';
  var ddsPath = this.world.basePath + this.name + '/' + this.name + '_PLANELIGHTINGMAP.DDS';
  var himRes = this.name + '_tilemap';
  var tilRes = this.name + '_heightmap';

  this.lightmapTex = RoseTextureManager.load(ddsPath);

  // TODO: Move the registration into the world manager.
  //   This is so if a chunk is unloaded and loaded again, we don't
  //   double register the resource.
  this.world.DM.register(tilRes, Tilemap, tilPath);
  this.world.DM.register(himRes, Heightmap, himPath);

  var self = this;
  this.world.DM.get(himRes, tilRes, function(heightmap, tilemap) {
    self.heightmap = heightmap;
    self.tilemap = tilemap;

    self._buildTerrain();
    callback();
  });
};

function _loadChunkObjectGroup(chunk, namePrefix, objList, modelList, lightmap, callback) {
  var waitAll = new MultiWait();
  for (var i = 0; i < objList.length; ++i) {
    var objData = objList[i];
    var obj = modelList.createForStatic(objData.objectId, lightmap, i, waitAll.one());
    obj.name = namePrefix + '_' + i;
    obj.position.copy(objData.position);
    obj.quaternion.copy(objData.rotation);
    obj.scale.copy(objData.scale);
    obj.updateMatrix();
    obj.matrixAutoUpdate = false;
    chunk.rootObj.add(obj);
    //this.octree.add(obj);
    chunk.world.objects.push(obj);
  }
  waitAll.wait(callback);
};
WorldChunk.prototype._loadObjects = function(callback) {
  var self = this;
  var ifoPath = this.world.basePath + this.name + '.IFO';
  var litCnstPath = this.world.basePath + this.name + '/LIGHTMAP/BUILDINGLIGHTMAPDATA.LIT';
  var litDecoPath = this.world.basePath + this.name + '/LIGHTMAP/OBJECTLIGHTMAPDATA.LIT';

  LightmapManager.load(litCnstPath, function(cnstLightmap) {
    LightmapManager.load(litDecoPath, function (decoLightmap) {
      MapInfo.load(ifoPath, function (ifoData) {
        var waitAll = new MultiWait();
        _loadChunkObjectGroup(self,'DECO_' + self.name, ifoData.objects, self.world.decoModelMgr, decoLightmap, waitAll.one());
        _loadChunkObjectGroup(self,'CNST_' + self.name, ifoData.buildings, self.world.cnstModelMgr, cnstLightmap, waitAll.one());
        waitAll.wait(callback);
      });
    });
  });
};

WorldChunk.prototype.load = function(callback) {
  if (this.loadState === 2) {
    if (!this.isVisible) {
      this.world.rootObj.add(this.rootObj);
      this.isVisible = true;
    }
    callback();
    return;
  }

  if (callback) {
    this.loadWaiters.push(callback);
  }

  if (this.loadState === 0) {
    this.world.rootObj.add(this.rootObj);
    this.isVisible = true;

    var waitAll = new MultiWait();
    this._loadTerrain(waitAll.one());
    this._loadObjects(waitAll.one());

    this.loadState = 1;

    var self = this;
    waitAll.wait(function () {
      self.loadState = 2;
      for (var i = 0; i < self.loadWaiters.length; ++i) {
        self.loadWaiters[i]();
      }
      self.loadWaiters = [];
    });
  }
};

WorldChunk.prototype.markNotNeeded = function() {
  if (this.isVisible) {
    this.world.rootObj.remove(this.rootObj);
    this.isVisible = false;
  }

  // TODO: Implement unloading
};
