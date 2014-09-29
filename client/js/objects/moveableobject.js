'use strict';

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(x, n) {
  return ((x % n) + n) %n;
}

var AVT_CLICK_EVENT_RANGE = 10.00;
var NPC_CLICK_EVENT_RANGE = 2.50;
var ITEM_CLICK_EVENT_RANGE = 1.50;

/**
 * @constructor
 */
function MoveableObject(type, world) {
  GameObject.call(this, type, world);

  this.direction = 0;
  this.moveSpeed = 550;
  this.activeCmd = null;
  this.nextCmd = null;
}
MoveableObject.prototype = new GameObject();

MoveableObject.prototype._setNextCmd = function(cmd) {
  if (this.activeCmd) {
    this.activeCmd.wantInterrupt = true;
    this.nextCmd = cmd;
  } else {
    this.activeCmd = cmd;
    this.activeCmd.enter();
  }
};

MoveableObject.prototype._moveTo = function(x, y) {
  this._setNextCmd(new MoveToPosCmd(this, new THREE.Vector2(x, y)));
};
MoveableObject.prototype.moveTo = function(x, y, z) {
  this._moveTo(x, y);

  // TODO: This does not properly handle moveTo being called on non-MC
  netGame.moveTo(x, y, z);
};

MoveableObject.prototype._moveToObj = function(gameObject, distance) {
  if (distance === undefined) {
    // TODO: Make sure this order check npc vs mob when inheritence is set up.
    // TODO: Handle items here...
    if (gameObject instanceof NpcObject) {
      distance = NPC_CLICK_EVENT_RANGE;
    } else if (gameObject instanceof CharObject) {
      distance = AVT_CLICK_EVENT_RANGE;
    /*} else if (gameObject instanceof ItemObject) {
      distance = ITEM_CLICK_EVENT_RANGE;*/
    }
  }

  this._setNextCmd(new MoveToObjCmd(this, gameObject, distance));
};

MoveableObject.prototype.moveToObj = function(gameObject, distance) {
  this._moveToObj(gameObject, distance);

  // Don't send network event for now...
};

MoveableObject.prototype.setDirection = function(radians) {
  this.direction = mod(radians, (Math.PI * 2));
  this.emit('moved');
};

MoveableObject.prototype.update = function(delta) {
  var deltaLeft = delta;
  while (this.activeCmd && deltaLeft > EPSILON) {
    deltaLeft = this.activeCmd.update(deltaLeft);

    if (this.activeCmd.isComplete) {
      this.activeCmd.leave();
      this.activeCmd = this.nextCmd;
      this.nextCmd = null;
      if (this.activeCmd) {
        this.activeCmd.enter();
      }
    }
  }
};
