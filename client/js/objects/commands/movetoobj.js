var MoveToPosCmd = require('./movetopos');

function MoveToObjCmd(object, targetObjRef, distance) {
  var targetPos = new THREE.Vector2(targetObjRef.position.x, targetObjRef.position.y);
  MoveToPosCmd.call(this, object, targetPos);
  this.target = targetObjRef;
  this.distance = distance;
}
MoveToObjCmd.prototype = Object.create(MoveToPosCmd.prototype);

MoveToObjCmd.prototype.update = (function() {
  var _targetDelta = new THREE.Vector3();
  var _normDir = new THREE.Vector3();

  return function(delta) {
    if (this.wantInterrupt) {
      this.isComplete = true;
      return delta;
    }

    // We check this here as our underlying object reference can
    //   change to a real object when it was once a proxy, so we
    //   mind as well be as clever as we can.
    if (this.distance === undefined) {
      var gameObject = this.target.object;
      if (gameObject) {
        if (gameObject instanceof NpcObject) {
          this.distance = NPC_CLICK_EVENT_RANGE;
        } else if (gameObject instanceof CharObject) {
          this.distance = AVT_CLICK_EVENT_RANGE;
        } else if (gameObject instanceof ItemObject) {
          this.distance = ITEM_CLICK_EVENT_RANGE;
        } else {
          console.warn('Distanceless MovToObj on unknown GO type.')
          this.distance = 0;
        }
      }
    }

    var thisObj = this.object;
    var thisPos = thisObj.position;
    var targetPos = this.target.position;

    var wantDist = (this.distance !== undefined) ? this.distance : 0;
    _targetDelta.copy(targetPos).sub(thisPos);

    this.object.direction = Math.atan2(_targetDelta.y, _targetDelta.x) + Math.PI / 2;

    if (_targetDelta.lengthSq() <= wantDist*wantDist) {
      this.isComplete = true;
      this.emit('finish');
      return delta;
    }

    this.targetPos.copy(targetPos);
    if (wantDist > 0) {
      _normDir.copy(_targetDelta).normalize().multiplyScalar(wantDist);
      this.targetPos.add(_normDir);
    }

    return MoveToPosCmd.prototype.update.call(this, delta);
  }
})();

module.exports = MoveToObjCmd;
