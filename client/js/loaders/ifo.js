var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {ZoneChunkData.Object[]} objects
 * @property {ZoneChunkData.Npc[]} npcs
 * @property {ZoneChunkData.Building[]} buildings
 * @property {ZoneChunkData.Sound[]} sounds
 * @property {ZoneChunkData.Effect[]} effects
 * @property {ZoneChunkData.Animation[]} animations
 * @property {ZoneChunkData.WaterPatches} waterPatches
 * @property {ZoneChunkData.MonsterSpawn[]} monsterSpawns
 * @property {ZoneChunkData.WaterPlane[]} waterPlanes
 * @property {ZoneChunkData.WarpPoint[]} warps
 * @property {ZoneChunkData.Collision[]} collisions
 * @property {ZoneChunkData.Event[]} events
 */
var ZoneChunkData = function() {
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
ZoneChunkData.BLOCK_TYPE = {
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
ZoneChunkData.MapObject = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 */
ZoneChunkData.Object = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {Number} aiIndex
 * @property {String} conFilePath
 */
ZoneChunkData.Npc = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 */
ZoneChunkData.Building = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {String} filePath
 * @property {Number} range
 * @property {Number} interval
 */
ZoneChunkData.Sound = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {String} filePath
 */
ZoneChunkData.Effect = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 */
ZoneChunkData.Animation = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {Number} width
 * @property {Number} height
 * @property {ZoneChunkData.WaterPatches.Patch[]} patches
 */
ZoneChunkData.WaterPatches = function() {
};


/**
 * @constructor
 * @property {Boolean} hasWater
 * @property {Number} height
 * @property {Number} type
 * @property {Number} id
 * @property {Number} unknown
 */
ZoneChunkData.WaterPatches.Patch = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {String} name
 * @property {ZoneChunkData.MonsterSpawn.Spawn[]} normal
 * @property {ZoneChunkData.MonsterSpawn.Spawn[]} tactical
 * @property {Number} interval
 * @property {Number} limit
 * @property {Number} range
 * @property {Number} tacticalPoints
 */
ZoneChunkData.MonsterSpawn = function() {
  this.normal = [];
  this.tactical = [];
};


/**
 * @constructor
 * @property {String} name
 * @property {Number} monster
 * @property {Number} count
 */
ZoneChunkData.MonsterSpawn.Spawn = function() {
};


/**
 * @constructor
 * @property {THREE.Vector3} start
 * @property {THREE.Vector3} end
 */
ZoneChunkData.WaterPlane = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 */
ZoneChunkData.WarpPoint = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 */
ZoneChunkData.Collision = function() {
};


/**
 * @constructor
 * @extends {ZoneChunkData.MapObject}
 * @property {String} funcName
 * @property {String} conFilePath
 */
ZoneChunkData.Event = function() {
};


/**
 * @param {BinaryReader} rh
 * @param {Object} object
 * @returns {Object}
 */
ZoneChunkData.loadMapObject = function(rh, object) {
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
 * @param {ZoneChunkData} mapInfo
 */

/**
 * @param {String} path
 * @param {MapInfo~onLoad} callback
 */
ZoneChunkData.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var blocks, count, i, j, k, object, offset, pos, type;
    var data = new ZoneChunkData();

    blocks = rh.readUint32();
    for (i = 0; i < blocks; ++i) {
      type   = rh.readUint32();
      offset = rh.readUint32();
      pos    = rh.tell();

      rh.seek(offset);
      if (type === ZoneChunkData.BLOCK_TYPE.INFO) {
        // Unknown format
      } else if (type === ZoneChunkData.BLOCK_TYPE.WATER_PATCH) {
        object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.WaterPatches());
        object.width  = rh.readUint32();
        object.height = rh.readUint32();

        for (j = 0; j < object.width * object.height; ++j) {
          var patch = new ZoneChunkData.WaterPatches.Patch();
          patch.hasWater = rh.readUint8() !== 0;
          patch.height   = rh.readFloat();
          patch.type     = rh.readUint32();
          patch.id       = rh.readUint32();
          patch.unknown  = rh.readUint32();
          object.patches[j] = patch;
        }

        data.waterPatches = object;
      } else {
        if (type === ZoneChunkData.BLOCK_TYPE.WATER_PLANE) {
          data.waterPlanes.waterSize = rh.readFloat();
        }

        var objects = rh.readUint32();
        for (j = 0; j < objects; ++j) {
          switch (type) {
          case ZoneChunkData.BLOCK_TYPE.OBJECT:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Object());
            data.objects.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.NPC:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Npc());
            object.aiIndex = rh.readUint32();
            object.conFilePath = rh.readUint8Str();
            data.npcs.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.BUILDING:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Building());
            data.buildings.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.SOUND:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Sound());
            object.filePath = rh.readUint8Str();
            object.range = rh.readUint32();
            object.interval = rh.readUint32();
            data.sounds.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.EFFECT:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Effect());
            object.filePath = rh.readUint8Str();
            data.effects.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.ANIMATION:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Animation());
            data.animations.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.MONSTER_SPAWN:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.MonsterSpawn());
            object.name = rh.readUint8Str();

            count = rh.readUint32();
            for (k = 0; k < count; ++k) {
              var spawn = new ZoneChunkData.MonsterSpawn.Spawn();
              spawn.name = rh.readUint8Str();
              spawn.monster = rh.readUint32();
              spawn.count = rh.readUint32();
              object.normal.push(spawn);
            }

            count = rh.readUint32();
            for (k = 0; k < count; ++k) {
              var spawn = new ZoneChunkData.MonsterSpawn.Spawn();
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
          case ZoneChunkData.BLOCK_TYPE.WATER_PLANE:
            object = new ZoneChunkData.WaterPlane();
            object.start = rh.readVector3xzy();
            object.end = rh.readVector3xzy();
            data.waterPlanes.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.WARP_POINT:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.WarpPoint());
            data.warps.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.COLLISION_OBJECT:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Collision());
            data.collisions.push(object);
            break;
          case ZoneChunkData.BLOCK_TYPE.EVENT_OBJECT:
            object = ZoneChunkData.loadMapObject(rh, new ZoneChunkData.Event());
            object.funcName = rh.readUint8Str();
            object.conFilePath = rh.readUint8Str();
            data.events.push(object);
            break;
          default:
              console.warn('Encountered unknown IFO block type:', type);
            break;
          }
        }
      }
      rh.seek(pos);
    }

    callback(data);
  });
};

module.exports = ZoneChunkData;
