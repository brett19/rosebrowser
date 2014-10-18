var MoCommand = require('./command');

/**
 * ActorObject command for handling moving to a position.
 *
 * @event enter When this command enters.
 * @event leave When this command leaves.
 * @event finish When we reach our target position.
 *
 * @param object
 * @param pos
 * @constructor
 */
function MoveToPosCmd(object, pos) {
  MoCommand.call(this, object);
  this.targetPos = pos;
}
MoveToPosCmd.prototype = Object.create(MoCommand.prototype);

MoveToPosCmd.prototype.enter = function() {
  var thisPos = this.object.position;
  var targetPos = this.targetPos;

  var deltaPos = new THREE.Vector2(targetPos.x-thisPos.x, targetPos.y-thisPos.y);
  this.object.direction = Math.atan2(deltaPos.y, deltaPos.x) + Math.PI / 2;

  this.object.pawn.playRunMotion();
};

MoveToPosCmd.prototype.leave = function() {
  if (!this.object.nextCmd) {
    this.object.pawn.playIdleMotion();
  }
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
    this.object.direction = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;

    var newPosition = thisPos.clone();
    newPosition.x += velocity.x;
    newPosition.y += velocity.y;

    var highZ = thisObj.world.findHighPoint(newPosition.x, newPosition.y, newPosition.z + 1);

    // TODO: Re-add proper slope checking!
    if (!thisObj.useMoveCollision || true) {
      newPosition.z = highZ;

      thisObj.setPosition(newPosition.x, newPosition.y, newPosition.z);

      // Check if we have reached our target?
      var targetDelta = thisObj.position.clone().sub(this.targetPos);
      if (targetDelta.lengthSq() <= EPSILON) {
        this.isComplete = true;
        this.emit('finish');
      }

      return deltaLeft;
    } else {
      // Bumped into something, just stop for now
      this.isComplete = true;
      return delta;
    }
  } else {
    this.isComplete = true;
    this.emit('finish');
    return delta;
  }
};

module.exports = MoveToPosCmd;
