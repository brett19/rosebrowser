'use strict';

function GameState() {

}

GameState.prototype.prepare = function(callback) {
  callback();
};

GameState.prototype.enter = function() {
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;
};

GameState.prototype.leave = function() {

};
