'use strict';

var AVT_CLICK_EVENT_RANGE = 10.00;
var NPC_CLICK_EVENT_RANGE = 2.50;
var ITEM_CLICK_EVENT_RANGE = 1.50;

function MoveToObjCmd(object, targetObjRef, distance) {
  var targetPos = new THREE.Vector2(targetObjRef.position.x, targetObjRef.position.y);
  MoveToPosCmd.call(this, object, targetPos);
  this.target = targetObjRef;
  this.distance = distance;
}
MoveToObjCmd.prototype = Object.create(MoveToPosCmd.prototype);

MoveToObjCmd.prototype.update = function(delta) {
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
      // TODO: Make sure this order check npc vs mob when inheritence is set up.
      // TODO: Handle items here...
      if (gameObject instanceof NpcObject) {
        this.distance = NPC_CLICK_EVENT_RANGE;
      } else if (gameObject instanceof CharObject) {
        this.distance = AVT_CLICK_EVENT_RANGE;
      /*} else if (gameObject instanceof ItemObject) {
         this.distance = ITEM_CLICK_EVENT_RANGE;*/
      }
    }
  }

  var thisObj = this.object;
  var thisPos = thisObj.position;
  var targetPos = this.target.position;

  var wantDist = (this.distance !== undefined) ? this.distance : 0;
  var targetDelta = targetPos.clone().sub(thisPos);
  if (targetDelta.lengthSq() > wantDist*wantDist + EPSILON) {
    var realTargetPos = targetPos.clone();
    if (this.distance > 0) {
      var distTargetDelta = targetDelta.clone().normalize().multiplyScalar(wantDist);
      realTargetPos.add(distTargetDelta);
    }

    this.targetPos = realTargetPos;
    return MoveToPosCmd.prototype.update.call(this, delta);
  } else {
    this.isComplete = true;
    this.emit('finish');
    return delta;
  }
};
