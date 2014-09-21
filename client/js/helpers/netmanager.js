'use strict';

function _NetManager(world) {
  this.world = world;
}

_NetManager.prototype._destroyWorld = function() {

};

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
      npc.moveTo(data.posTo.x, data.posTo.y);
    }
    GOM.addObject(npc);
  });

  gn.on('spawn_char', function(data) {
    var char = new CharObject(self.world);
    char.serverObjectIdx = data.objectIdx;
    char.name = data.name;
    char.level = data.level;
    char.setPosition(data.position.x, data.position.y, 10);
    char.gender = data.gender;
    char.visParts = data.parts;
    char.dropFromSky();
    if (data.command !== 0) {
      char.moveTo(data.posTo.x, data.posTo.y);
    }
    GOM.addObject(char);
  });

  gn.on('obj_moveto', function(data) {
    var obj = GOM.findByServerObjectIdx(data.objectIdx);
    if (obj) {
      obj.moveTo(data.posTo.x, data.posTo.y);
    }
  });
};

var NetManager = new _NetManager();
