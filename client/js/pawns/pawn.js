'use strict';

function Pawn() {
  this.rootObj = new THREE.Object3D();
  this.rootObj.owner = this;
  this.direction = 0;
}

Pawn.prototype.setPosition = function(pos) {
  this.rootObj.position.copy(pos);
};

Pawn.prototype.setDirection = function(radians) {
  this.direction = radians;
};

Pawn.prototype.update = function(delta) {
  var dirStep = (Math.PI * 3) * delta;
  var deltaDir = slerp1d(this.direction, this.rootObj.rotation.z);

  if (deltaDir > dirStep || deltaDir < -dirStep) {
    if (deltaDir < 0) {
      this.rootObj.rotation.z -= dirStep;
    } else {
      this.rootObj.rotation.z += dirStep;
    }
  } else {
    this.rootObj.rotation.z = this.direction;
  }
};
