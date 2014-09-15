/**
 * @constructor
 * @property {MapInfo.Object[]} objects
 * @property {MapInfo.Npc[]} npcs
 * @property {MapInfo.Building[]} buildings
 * @property {MapInfo.Sound[]} sounds
 * @property {MapInfo.Effect[]} effects
 * @property {MapInfo.Animation[]} animations
 * @property {MapInfo.WaterPatches} waterPatches
 * @property {MapInfo.MonsterSpawn[]} monsterSpawns
 * @property {MapInfo.WaterPlane[]} waterPlanes
 * @property {MapInfo.WarpPoint[]} warps
 * @property {MapInfo.Collision[]} collisions
 * @property {MapInfo.Event[]} events
 */
var MapInfo = function() {
  this.objects = [];
  this.npcs = [];
  this.buildings = [];
  this.sounds = [];
  this.effects = [];
  this.animations = [];
  this.monsterSpawns = [];
  this.waterPlanes = [];
  this.warps = [];
  this.collisions = [];
  this.events = [];
};


/**
 * @enum {Number}
 * @readonly
 */
MapInfo.BLOCK_TYPE = {
  INFO: 0,
  OBJECT: 1,
  NPC: 2,
  BUILDING: 3,
  SOUND: 4,
  EFFECT: 5,
  ANIMATION: 6,
  WATER_PATCH: 7,
  MONSTER_SPAWN: 8,
  WATER_PLANE: 9,
  WARP_POINT: 10,
  COLLISION_OBJECT: 11,
  EVENT_OBJECT: 12
};


/**
 * @constructor
 * @property {String} name
 * @property {Number} warpId
 * @property {Number} eventId
 * @property {Number} objectType
 * @property {Number} objectId
 * @property {THREE.Vector2} mapPosition
 * @property {THREE.Quaternion} rotation
 * @property {THREE.Vector3} position
 * @property {THREE.Vector3} scale
 */
MapInfo.MapObject = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 */
MapInfo.Object = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {Number} aiIndex
 * @property {String} conFilePath
 */
MapInfo.Npc = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 */
MapInfo.Building = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {String} filePath
 * @property {Number} range
 * @property {Number} interval
 */
MapInfo.Sound = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {String} filePath
 */
MapInfo.Effect = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 */
MapInfo.Animation = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {Number} width
 * @property {Number} height
 * @property {MapInfo.WaterPatches.Patch[]} patches
 */
MapInfo.WaterPatches = function() {
};


/**
 * @constructor
 * @property {Boolean} hasWater
 * @property {Number} height
 * @property {Number} type
 * @property {Number} id
 * @property {Number} unknown
 */
MapInfo.WaterPatches.Patch = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {String} name
 * @property {MapInfo.MonsterSpawn.Spawn[]} normal
 * @property {MapInfo.MonsterSpawn.Spawn[]} tactical
 * @property {Number} interval
 * @property {Number} limit
 * @property {Number} range
 * @property {Number} tacticalPoints
 */
MapInfo.MonsterSpawn = function() {
  this.normal = [];
  this.tactical = [];
};


/**
 * @constructor
 * @property {String} name
 * @property {Number} monster
 * @property {Number} count
 */
MapInfo.MonsterSpawn.Spawn = function() {
};


/**
 * @constructor
 * @property {THREE.Vector3} start
 * @property {THREE.Vector3} end
 */
MapInfo.WaterPlane = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 */
MapInfo.WarpPoint = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 */
MapInfo.Collision = function() {
};


/**
 * @constructor
 * @extends {MapInfo.MapObject}
 * @property {String} funcName
 * @property {String} conFilePath
 */
MapInfo.Event = function() {
};


/**
 * @param {BinaryReader} rh
 * @param {Object} object
 * @returns {Object}
 */
MapInfo.loadMapObject = function(rh, object) {
  object.name        = rh.readUint8Str();
  object.warpId      = rh.readUint16();
  object.eventId     = rh.readUint16();
  object.objectType  = rh.readUint32();
  object.objectId    = rh.readUint32();
  object.mapPosition = rh.readIntVector2();
  object.rotation    = rh.readQuat();
  object.position    = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
  object.scale       = rh.readVector3();
  return object;
};


/**
 * @callback MapInfo~onLoad
 * @param {MapInfo} mapInfo
 */

/**
 * @param {String} path
 * @param {MapInfo~onLoad} callback
 */
MapInfo.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var blocks, count, i, j, k, object, offset, pos, type;
    var data = new MapInfo();

    blocks = rh.readUint32();
    for (i = 0; i < blocks; ++i) {
      type   = rh.readUint32();
      offset = rh.readUint32();
      pos    = rh.tell();

      rh.seek(offset);
      if (type === MapInfo.BLOCK_TYPE.INFO) {
        // Unknown format
      } else if (type === MapInfo.BLOCK_TYPE.WATER_PATCH) {
        object = MapInfo.loadMapObject(rh, new MapInfo.WaterPatches());
        object.width  = rh.readUint32();
        object.height = rh.readUint32();

        for (j = 0; j < object.width * object.height; ++j) {
          var patch = new MapInfo.WaterPatches.Patch();
          patch.hasWater = rh.readUint8() !== 0;
          patch.height   = rh.readFloat();
          patch.type     = rh.readUint32();
          patch.id       = rh.readUint32();
          patch.unknown  = rh.readUint32();
          object.patches[j] = patch;
        }

        data.waterPatches = object;
      } else {
        if (type === MapInfo.BLOCK_TYPE.WATER_PLANE) {
          data.waterPlanes.waterSize = rh.readFloat();
        }

        var objects = rh.readUint32();
        for (j = 0; j < objects; ++j) {
          switch (type) {
          case MapInfo.BLOCK_TYPE.OBJECT:
            object = MapInfo.loadMapObject(rh, new MapInfo.Object());
            data.objects.push(object);
            break;
          case MapInfo.BLOCK_TYPE.NPC:
            object = MapInfo.loadMapObject(rh, new MapInfo.Npc());
            object.aiIndex = rh.readUint32();
            object.conFilePath = rh.readUint8Str();
            data.npcs.push(object);
            break;
          case MapInfo.BLOCK_TYPE.BUILDING:
            object = MapInfo.loadMapObject(rh, new MapInfo.Building());
            data.buildings.push(object);
            break;
          case MapInfo.BLOCK_TYPE.SOUND:
            object = MapInfo.loadMapObject(rh, new MapInfo.Sound());
            object.filePath = rh.readUint8Str();
            object.range = rh.readUint32();
            object.interval = rh.readUint32();
            data.sounds.push(object);
            break;
          case MapInfo.BLOCK_TYPE.EFFECT:
            object = MapInfo.loadMapObject(rh, new MapInfo.Effect());
            object.filePath = rh.readUint8Str();
            data.effects.push(object);
            break;
          case MapInfo.BLOCK_TYPE.ANIMATION:
            object = MapInfo.loadMapObject(rh, new MapInfo.Animation());
            data.animations.push(object);
            break;
          case MapInfo.BLOCK_TYPE.MONSTER_SPAWN:
            object = MapInfo.loadMapObject(rh, new MapInfo.MonsterSpawn());
            object.name = rh.readUint8Str();

            count = rh.readUint32();
            for (k = 0; k < count; ++k) {
              var spawn = new MapInfo.MonsterSpawn.Spawn();
              spawn.name = rh.readUint8Str();
              spawn.monster = rh.readUint32();
              spawn.count = rh.readUint32();
              object.normal.push(spawn);
            }

            count = rh.readUint32();
            for (k = 0; k < count; ++k) {
              var spawn = new MapInfo.MonsterSpawn.Spawn();
              spawn.name = rh.readUint8Str();
              spawn.monster = rh.readUint32();
              spawn.count = rh.readUint32();
              object.tactical.push(spawn);
            }

            object.interval = rh.readUint32();
            object.limit = rh.readUint32();
            object.range = rh.readUint32();
            object.tacticalPoints = rh.readUint32();
            data.monsterSpawns.push(object);
            break;
          case MapInfo.BLOCK_TYPE.WATER_PLANE:
            object = new MapInfo.WaterPlane();
            object.start = rh.readVector3();
            object.end = rh.readVector3();
            data.waterPlanes.push(object);
            break;
          case MapInfo.BLOCK_TYPE.WARP_POINT:
            object = MapInfo.loadMapObject(rh, new MapInfo.WarpPoint());
            data.warps.push(object);
            break;
          case MapInfo.BLOCK_TYPE.COLLISION_OBJECT:
            object = MapInfo.loadMapObject(rh, new MapInfo.Collision());
            data.collisions.push(object);
            break;
          case MapInfo.BLOCK_TYPE.EVENT_OBJECT:
            object = MapInfo.loadMapObject(rh, new MapInfo.Event());
            object.funcName = rh.readUint8Str();
            object.conFilePath = rh.readUint8Str();
            data.events.push(object);
            break;
          default:
            break;
          }
        }
      }
      rh.seek(pos);
    }

    callback(data);
  });
};
