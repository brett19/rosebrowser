'use strict';

function GameObject(objType, world) {
  EventEmitter.call(this);

  this.world = world;
  this.type = objType;
  this.serverObjectIdx = -1;
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.targetPos = new THREE.Vector3(0, 0, 0);
  this.isMoving = false;
  this.moveSpeed = 0.2;
}
GameObject.prototype = new EventEmitter();

GameObject.prototype.moveTo = function(x, y) {
  console.log('Object move-to', this.type, 'to', x, y);
  this.targetPos.set(x, y, 0);
  this.isMoving = true;
};

GameObject.prototype.setPosition = function(x, y, z) {
  this.position.set(x, y, z);
  this.emit('moved');
};

GameObject.prototype.dropFromSky = function() {
  var highZ = this.world.findHighPoint(this.position.x, this.position.y);
  this.position.z = highZ;
  this.emit('moved');
};

GameObject.prototype.update = function(delta) {
  if (this.isMoving) {
    this.targetPos.z = this.position.z;

    this.velocity.subVectors(this.targetPos, this.position);
    if (this.velocity.lengthSq() > this.moveSpeed*this.moveSpeed) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(this.moveSpeed);
    }
    if (this.velocity.lengthSq() > 0.00001) {
      var newPosition = this.position.clone().add(this.velocity);
      var highZ = this.world.findHighPoint(newPosition.x, newPosition.y);
      if ((highZ - this.position.z) / this.velocity.length() < 0.5) {
        newPosition.z = highZ;
        this.position.copy(newPosition);
        this.emit('moved');
      } else {
        // Bumped into something, just stop for now
        this.isMoving = false;
      }
    } else {
      this.isMoving = false;
    }
  }
};
