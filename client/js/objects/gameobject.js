'use strict';

function GameObject(objType) {
  this.type = objType;
  this.serverObjectIdx = -1;
  this.position = new THREE.Vector3(0, 0, 0);
}

GameObject.prototype.setPosition = function(x, y, z) {
  this.position.set(x, y, z);
};
