'use strict';

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
    npc.setPosition(data.position.x, data.position.y, 10);
    npc.setDirection(data.modelDir / 180 * Math.PI);
    npc.dropFromSky();
    if (data.command !== 0) {
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
    char.debugValidate();
    char.dropFromSky();
    if (data.command !== 0) {
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
    mob.setPosition(data.position.x, data.position.y, 10);
    mob.dropFromSky();
    if (data.command !== 0) {
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
        targetObj = GOM.findByServerObjectIdx(data.targetObjectIdx);
      }
      if (targetObj) {
        // TODO: This may be incorrect in a specific corner case.  See comment.
        // In the case that the object they are moving to is offscreen, we
        //   will not receive a targetObj, since we don't have any local data
        //   about the game object we are approaching.  When this happens, we
        //   fall back to using the position that is in the packet, however, if
        //   we later get close enough to see the target, and it has moved away
        //   from where it was when they were targetted, our internal state
        //   will not update to target this newly available targetObj.  This
        //   may cause the object to stop following locally, but continue
        //   to follow the target remotely.  The official client may not handle
        //   this appropriately, however the server knows of all game objects
        //   and will be accurate, we should ensure to match the server here.
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
