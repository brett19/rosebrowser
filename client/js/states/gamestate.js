'use strict';

function GameState() {
  this.worldMgr = new WorldManager();
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

GameState.prototype.enter = function() {
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;
  scene.add(this.worldMgr.rootObj);
};

GameState.prototype.leave = function() {
  scene.remove(this.worldMgr.rootObj);
};

var gsGame = new GameState();
