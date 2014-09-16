'use strict';

function _NetManager() {

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

  gn.on('spawn_npc_char', function(data) {
    var npc = new NpcObject();
    npc.serverObjectIdx = data.objectIdx;
    if (data.charIdx > 0) {
      npc.charIdx = data.charIdx;
    } else {
      npc.charIdx = -data.charIdx;
      npc.hidden = true;
    }
    npc.setPosition(data.position.x, data.position.y, 10);
    npc.setDirection(data.modelDir);
    GOM.addObject(npc);
  });
};

var NetManager = new _NetManager();
