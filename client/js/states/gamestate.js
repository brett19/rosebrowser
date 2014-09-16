'use strict';

function GameState() {
  this.worldMgr = new WorldManager();
  this.worldMgr.rootObj.position.set(5200, 5200, 0);
  this.gomMgr = new GOMVisManager(this.worldMgr);
  this.activeMapIdx = -1;
}

GameState.prototype.setMap = function(mapIdx) {
  this.activeMapIdx = mapIdx;
};

GameState.prototype.prepare = function(callback) {
  this.mapSwitchPrep(callback);
};

/**
 * This is used for initial login as well as map switch.
 * @param callback
 */
GameState.prototype.mapSwitchPrep = function(callback) {
  this.worldMgr.setMap(this.activeMapIdx, function() {
    callback();
  });
};

GameState.prototype.update = function() {

};

GameState.prototype.debugPrintScene = function() {
  function _printThis(obj) {
    var out = '';
    out += 'OBJ';
    out += '[' + obj.name + ']';
    out += ' @ ' + obj.position.x + ',' + obj.position.y + ',' + obj.position.z;

    console.groupCollapsed(out);
    for (var j = 0; j < obj.children.length; ++j) {
      _printThis(obj.children[j]);
    }
    console.groupEnd();
  }
  _printThis(scene);
};

GameState.prototype.enter = function() {
  debugGui.add(this, 'debugPrintScene');

  // Some of this will need to be moved to a place thats used when you
  //  switch maps as well...
  scene.add(MC.avatar.rootObj);
  camera.lookAt(0, 0, 0);
  camera.position.set(4, 4, 4);
  MC.avatar.rootObj.add(camera);

  this.worldMgr.addToScene();
  this.gomMgr.addToScene();

  var avtPos = MC.avatar.rootObj.position;
  var highPoint = this.worldMgr.findHighPoint(avtPos.x, avtPos.y);
  MC.avatar.rootObj.position.z = highPoint;

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;

  netGame.joinZone(highPoint, function() {
    console.log('ZONE JOINED');
  });
};

GameState.prototype.leave = function() {
  scene.remove(this.worldMgr.rootObj);
};

var gsGame = new GameState();
