'use strict';

function MoveableObject(type, world) {
  GameObject.call(this, type, world);

  this.velocity = new THREE.Vector3(0, 0, 0);
  this.targetPos = new THREE.Vector3(0, 0, 0);
  this.isMoving = false;
  this.moveSpeed = 0.2;
}
MoveableObject.prototype = new GameObject();

MoveableObject.prototype.moveTo = function(x, y) {
  console.log('Object move-to', this.type, 'to', x, y);
  this.targetPos.set(x, y, 0);
  this.isMoving = true;
};

MoveableObject.prototype.update = function(delta) {
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
