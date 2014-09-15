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

  gn.on('spawn_object', function(data) {
    // Do something with GOM
  });
};

var NetManager = new _NetManager();
