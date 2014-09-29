'use strict';

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(x, n) {
  return ((x % n) + n) %n;
}

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
  // We do not enter the newly submitted command immediately from here
  //   to allow callers of this function to assign event handlers for
  //   start or finish first.

  if (this.activeCmd) {
    this.activeCmd.wantInterrupt = true;
  }

  this.nextCmd = cmd;

  return cmd;
};

MoveableObject.prototype._moveTo = function(x, y) {
  return this._setNextCmd(new MoveToPosCmd(this, new THREE.Vector2(x, y)));
};
MoveableObject.prototype.moveTo = function(x, y, z) {
  var cmd = this._moveTo(x, y);

  // TODO: This does not properly handle moveTo being called on non-MC
  netGame.moveTo(x, y, z);

  return cmd;
};

MoveableObject.prototype._moveToObj = function(objectRef, distance) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _moveToObj was not a GORef.');
    return;
  }

  return this._setNextCmd(new MoveToObjCmd(this, objectRef, distance));
};

MoveableObject.prototype.moveToObj = function(gameObject, distance) {
  if (!(gameObject instanceof GameObject)) {
    console.warn('Object passed to moveToObj was not a GameObject.');
    return;
  }

  var cmd = this._moveToObj(gameObject.ref, distance);

  // Don't send network event for now...

  return cmd;
};

MoveableObject.prototype.setDirection = function(radians) {
  this.direction = mod(radians, (Math.PI * 2));
  this.emit('moved');
};

MoveableObject.prototype.update = function(delta) {
  var deltaLeft = delta;
  while (deltaLeft > EPSILON) {
    if (!this.activeCmd) {
      if (this.nextCmd) {
        this.activeCmd = this.nextCmd;
        this.nextCmd = null;
        this.activeCmd._enter();
      } else {
        break;
      }
    }

    deltaLeft = this.activeCmd.update(deltaLeft);

    if (this.activeCmd.isComplete) {
      this.activeCmd._leave();
      this.activeCmd = null;
    }
  }
};
