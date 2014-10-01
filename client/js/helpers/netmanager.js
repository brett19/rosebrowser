'use strict';

var OBJECT_COMMAND = {
    STOP: 0,
    ATTACK: 1,
    SIT: 2,
    STAND: 3,
    MOVE: 4,
    DIE: 5,
    TOGGLE: 6,
    Skill2SELF: 7,
    Skill2OBJ: 8,
    Skill2POS: 9,
    MAX: 10
};

/**
 * This class handles tying together the networking clients with the
 * actual game world and GameObjectManager.
 *
 * @private
 */
function _NetManager() {
  this.world = null;
}

/**
 * @private
 */
_NetManager.prototype._destroyWorld = function() {
  throw new Error('Not Yet Supported');
};

/**
 * Begins watching a WorldClient and GameClient for events.
 *
 * Note: You must set the world property before calling this!
 *
 * @param {WorldClient} wn
 * @param {GameClient} gn
 */
_NetManager.prototype.watch = function(wn, gn) {
  var self = this;
  wn.on('end', function() {
    gn.end();
    self._destroyWorld();
  });
  gn.on('end', function() {
    wn.end();
    self._destroyWorld();
  });

  gn.on('spawn_npc', function(data) {
    var npc = new NpcObject(self.world);
    npc.serverObjectIdx = data.objectIdx;
    if (data.charIdx > 0) {
      npc.charIdx = data.charIdx;
    } else {
      npc.charIdx = -data.charIdx;
      npc.hidden = true;
    }
    npc.eventIdx = data.eventIdx;
    npc.stats = new NpcStats(npc);
    npc.setPosition(data.position.x, data.position.y, 10);
    npc.setDirection(data.modelDir / 180 * Math.PI);
    npc.dropFromSky();
    if (data.command === OBJECT_COMMAND.MOVE) {
      npc._moveTo(data.posTo.x, data.posTo.y);
    }
    GOM.addObject(npc);
  });

  gn.on('spawn_char', function(data) {
    var char = new CharObject(self.world);
    char.serverObjectIdx = data.objectIdx;
    char.name = data.name;
    char.level = data.level;
    char.moveSpeed = data.runSpeed;
    char.setPosition(data.position.x, data.position.y, 10);
    char.gender = data.gender;
    char.hp = data.hp;
    char.job = data.job;
    char.hairColor = data.hairColor;
    char.visParts = data.parts;
    char.stats = new CharStats(char);
    char.stats.attackSpeed = data.attackSpeed;
    char.stats.attackSpeedBase = data.attackSpeedBase;
    char.debugValidate();
    char.dropFromSky();
    if (data.command === OBJECT_COMMAND.MOVE) {
      char._moveTo(data.posTo.x, data.posTo.y);
    }
    GOM.addObject(char);
  });

  gn.on('spawn_mob', function(data) {
    var mob = new MobObject(self.world);
    mob.serverObjectIdx = data.objectIdx;
    if (data.charIdx > 0) {
      mob.charIdx = data.charIdx;
    } else {
      mob.charIdx = -data.charIdx;
      mob.hidden = true;
    }
    mob.stats = new NpcStats(mob);
    mob.setPosition(data.position.x, data.position.y, 10);
    mob.dropFromSky();
    if (data.command === OBJECT_COMMAND.MOVE) {
      mob._moveTo(data.posTo.x, data.posTo.y);
    }
    GOM.addObject(mob);
  });

  gn.on('obj_remove', function(data) {
    var obj = GOM.findByServerObjectIdx(data.objectIdx);
    if (obj) {
      GOM.removeObject(obj);
    }
  });

  gn.on('obj_moveto', function(data) {
    var obj = GOM.findByServerObjectIdx(data.objectIdx);
    if (obj) {
      var targetObj = null;
      if (data.targetObjectIdx) {
        targetObj = GOM.getRefByServerObjectIdx(
            data.targetObjectIdx,
            new THREE.Vector3(data.posTo.x, data.posTo.y, data.posZ));
      }
      if (targetObj) {
        obj._moveToObj(targetObj);
      } else {
        obj._moveTo(data.posTo.x, data.posTo.y);
      }
    }
  });
};

/**
 * @type {_NetManager}
 */
var NetManager = new _NetManager();
