'use strict';

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(x, n) {
  return ((x % n) + n) %n;
}

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
  this.direction = mod(radians, (Math.PI * 2));
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

        var newDirection = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI/2;

        newDirection = mod(newDirection, (Math.PI * 2));

        var dirDelta = newDirection - this.direction;

        var dirStep = (Math.PI * 3) * delta;

        // Note: In order to avoid the spins problems, and ease the computations,
        // the direction is bounded between 0 and 2 * PI.

        if (dirDelta > 0) {
          // If the newDirection get an angle greater than before.
          if (dirDelta > Math.PI) {
            // If the difference of direction is greater than PI.
            // The shortest path is to rotate backward until we go below 0.
            if (this.direction - dirStep >= 0) {
              this.direction -= dirStep;
            } else {
              // If the step goes below 0, we must ensure we didn't rotate too much,
              // as well as applying the direction bounds.
              var postiveDirect = mod((this.direction - dirStep), (Math.PI * 2));
              if (postiveDirect > newDirection) {
                this.direction = postiveDirect;
              } else {
                this.direction = newDirection;
              }
            }
          } else {
            // Otherwise we wimply rotate forward.
            if (this.direction + dirStep > newDirection) {
              this.direction = newDirection;
            } else {
              this.direction += dirStep;
            }
          }
        } else {
          // If the newDirection get an angle smaller than before.
          if (dirDelta < - Math.PI) {
            // If the difference of direction is greater than PI.
            // The shortest path is to rotate forward until we go further than 2 * PI.
            if (this.direction + dirStep < Math.PI * 2) {
              this.direction += dirStep;
            } else {
              // If the step goes over 2 * PI, we must ensure we didn't rotate too much,
              // as well as applying the direction bounds.
              var lessthan2piDirect = mod((this.direction + dirStep), (Math.PI * 2));
              if (lessthan2piDirect < newDirection) {
                this.direction = lessthan2piDirect;
              } else {
                this.direction = newDirection;
              }
            }
          } else {
            // Otherwise we wimply rotate backward.
            if (this.direction - dirStep < newDirection) {
              this.direction = newDirection;
            } else {
              this.direction -= dirStep;
            }            
          }
        }

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
