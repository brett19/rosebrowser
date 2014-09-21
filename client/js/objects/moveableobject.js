'use strict';

function MoveableObject(type, world) {
  GameObject.call(this, type, world);

  this.velocity = new THREE.Vector3(0, 0, 0);
  this.targetPos = new THREE.Vector3(0, 0, 0);
  this.direction = 0;
  this.isMoving = false;
  this.moveSpeed = 550;
  this.useMoveCollision = false;
}
MoveableObject.prototype = new GameObject();

MoveableObject.prototype.moveTo = function(x, y) {
  this.targetPos.set(x, y, 0);
  this.isMoving = true;
  this.emit('start_move');
};

MoveableObject.prototype.setDirection = function(radians) {
  this.direction = radians;
  this.emit('moved');
};

MoveableObject.prototype.update = function(delta) {
  if (this.isMoving) {
    var frameMoveSpeed = this.moveSpeed * 0.01 * delta;

    this.targetPos.z = this.position.z;

    this.velocity.subVectors(this.targetPos, this.position);
    if (this.velocity.lengthSq() > frameMoveSpeed*frameMoveSpeed) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(frameMoveSpeed);
    }
    if (this.velocity.lengthSq() > 0.00001) {
      var newPosition = this.position.clone().add(this.velocity);
      var highZ = this.world.findHighPoint(newPosition.x, newPosition.y, newPosition.z + 1);
      var moveSlope = (highZ - this.position.z) / this.velocity.length();

      // TODO: Readd proper slope checking!
      if (!this.useMoveCollision || true) {
        newPosition.z = highZ;

        var posDiff = new THREE.Vector2(
            this.position.x-newPosition.x,
            this.position.y-newPosition.y);
        var newDirection = Math.atan2(posDiff.y, posDiff.x) - Math.PI/2;

        var dirDelta = newDirection - this.direction;
        if (dirDelta < -Math.PI) {
          dirDelta += Math.PI * 2;
        } else if(dirDelta > Math.PI) {
          dirDelta -= Math.PI * 2;
        }

        var maxDelta = (Math.PI * 3) * delta;
        if (dirDelta < -maxDelta) {
          dirDelta = -maxDelta;
        } else if (dirDelta > maxDelta) {
          dirDelta = maxDelta;
        }

        this.direction += dirDelta;


        this.position.copy(newPosition);
        this.emit('moved');
      } else {
        // Bumped into something, just stop for now
        this.isMoving = false;
        this.emit('stop_move');
      }
    } else {
      this.isMoving = false;
      this.emit('stop_move');
    }
  }
};
