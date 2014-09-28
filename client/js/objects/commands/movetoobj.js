'use strict';

function MoveToObjCmd(object, targetObj, distance) {
  var targetPos = new THREE.Vector2(targetObj.position.x, targetObj.position.y);
  MoveToPosCmd.call(this, object, targetPos);
  this.target = targetObj;
  this.distance = distance !== undefined ? distance : 0;
}
MoveToObjCmd.prototype = Object.create(MoveToPosCmd.prototype);

MoveToObjCmd.prototype.update = function(delta) {
  if (this.wantInterrupt) {
    this.isComplete = true;
    return delta;
  }

  var thisObj = this.object;
  var thisPos = thisObj.position;
  var targetPos = this.target.position;

  var targetDelta = targetPos.clone().sub(thisPos);
  if (targetDelta.lengthSq() > this.distance*this.distance + EPSILON) {
    var realTargetPos = targetPos.clone();
    if (this.distance > 0) {
      var distTargetDelta = targetDelta.clone().normalize().multiplyScalar(this.distance);
      realTargetPos.add(distTargetDelta);
    }

    this.targetPos = realTargetPos;
    return MoveToPosCmd.prototype.update.call(this, delta);
  } else {
    this.isComplete = true;
    return delta;
  }
};
