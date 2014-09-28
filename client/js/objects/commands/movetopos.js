'use strict';

var EPSILON = 0.0001;

function MoveToPosCmd(object, pos) {
  MoCommand.call(this, object);
  this.targetPos = pos;
}
MoveToPosCmd.prototype = Object.create(MoCommand.prototype);

MoveToPosCmd.prototype.enter = function() {
  this.object.emit('start_move');
};

MoveToPosCmd.prototype.leave = function() {
  this.object.emit('stop_move');
};

MoveToPosCmd.prototype.update = function(delta) {
  if (this.wantInterrupt) {
    this.isComplete = true;
    return delta;
  }

  var thisObj = this.object;
  var thisPos = thisObj.position;
  var targetPos = this.targetPos;
  var deltaLeft = 0;

  var frameMoveSpeed = thisObj.moveSpeed * 0.01 * delta;

  var velocity = new THREE.Vector2(targetPos.x-thisPos.x, targetPos.y-thisPos.y);
  if (velocity.lengthSq() > frameMoveSpeed*frameMoveSpeed) {
    velocity.normalize();
    velocity.multiplyScalar(frameMoveSpeed);
  } else {
    deltaLeft = delta * (1 - (velocity.length() / frameMoveSpeed));
  }
  if (velocity.lengthSq() > EPSILON) {
    var newPosition = thisPos.clone();
    newPosition.x += velocity.x;
    newPosition.y += velocity.y;

    var highZ = thisObj.world.findHighPoint(newPosition.x, newPosition.y, newPosition.z + 1);

    // TODO: Re-add proper slope checking!
    if (!thisObj.useMoveCollision || true) {
      newPosition.z = highZ;

      var newDirection = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;

      newDirection = mod(newDirection, (Math.PI * 2));

      var dirDelta = newDirection - thisObj.direction;

      var dirStep = (Math.PI * 3) * delta;

      // Note: In order to avoid the spins problems, and ease the computations,
      // the direction is bounded between 0 and 2 * PI.

      if (dirDelta > 0) {
        // If the newDirection get an angle greater than before.
        if (dirDelta > Math.PI) {
          // If the difference of direction is greater than PI.
          // The shortest path is to rotate backward until we go below 0.
          if (thisObj.direction - dirStep >= 0) {
            thisObj.direction -= dirStep;
          } else {
            // If the step goes below 0, we must ensure we didn't rotate too much,
            // as well as applying the direction bounds.
            var postiveDirect = mod((thisObj.direction - dirStep), (Math.PI * 2));
            if (postiveDirect > newDirection) {
              thisObj.direction = postiveDirect;
            } else {
              thisObj.direction = newDirection;
            }
          }
        } else {
          // Otherwise we wimply rotate forward.
          if (thisObj.direction + dirStep > newDirection) {
            thisObj.direction = newDirection;
          } else {
            thisObj.direction += dirStep;
          }
        }
      } else {
        // If the newDirection get an angle smaller than before.
        if (dirDelta < -Math.PI) {
          // If the difference of direction is greater than PI.
          // The shortest path is to rotate forward until we go further than 2 * PI.
          if (thisObj.direction + dirStep < Math.PI * 2) {
            thisObj.direction += dirStep;
          } else {
            // If the step goes over 2 * PI, we must ensure we didn't rotate too much,
            // as well as applying the direction bounds.
            var lessthan2piDirect = mod((thisObj.direction + dirStep), (Math.PI * 2));
            if (lessthan2piDirect < newDirection) {
              thisObj.direction = lessthan2piDirect;
            } else {
              thisObj.direction = newDirection;
            }
          }
        } else {
          // Otherwise we wimply rotate backward.
          if (thisObj.direction - dirStep < newDirection) {
            thisObj.direction = newDirection;
          } else {
            thisObj.direction -= dirStep;
          }
        }
      }

      thisObj.setPosition(newPosition.x, newPosition.y, newPosition.z);
      return deltaLeft;
    } else {
      // Bumped into something, just stop for now
      this.isComplete = true;
      return delta;
    }
  } else {
    this.isComplete = true;
    return delta;
  }
};
