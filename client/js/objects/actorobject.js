'use strict';

// http://javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(x, n) {
  return ((x % n) + n) %n;
}

/**
 * @constructor
 */
function ActorObject(type, world) {
  GameObject.call(this, type, world);

  this.direction = 0;
  this.speed = 0;
  this.moveSpeed = 550;
  this.activeCmd = null;
  this.nextCmd = null;
}
ActorObject.prototype = new GameObject();

ActorObject.prototype._setNextCmd = function(cmd) {
  // We do not enter the newly submitted command immediately from here
  //   to allow callers of this function to assign event handlers for
  //   start or finish first.

  if (this.activeCmd) {
    this.activeCmd.wantInterrupt = true;
  }

  this.nextCmd = cmd;

  return cmd;
};

ActorObject.prototype._moveTo = function(x, y) {
  return this._setNextCmd(new MoveToPosCmd(this, new THREE.Vector2(x, y)));
};
ActorObject.prototype.moveTo = function(x, y, z) {
  var cmd = this._moveTo(x, y);
  // TODO: This does not properly handle moveTo being called on non-MC
  netGame.moveTo(x, y, z);
  return cmd;
};

ActorObject.prototype._moveToObj = function(objectRef, distance) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _moveToObj was not a GORef.');
    return;
  }
  return this._setNextCmd(new MoveToObjCmd(this, objectRef, distance));
};

ActorObject.prototype.moveToObj = function(gameObject, distance) {
  if (!(gameObject instanceof GameObject)) {
    console.warn('Object passed to moveToObj was not a GameObject.');
    return;
  }
  var cmd = this._moveToObj(gameObject.ref, distance);
  netGame.moveTo(gameObject.position.x, gameObject.position.y, gameObject.position.z, gameObject.serverObjectIdx);
  return cmd;
};

ActorObject.prototype._attackObj = function(objectRef) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _attackObj was not a GORef.');
    return;
  }
  return this._setNextCmd(new AttackCmd(this, objectRef));
};

ActorObject.prototype.attackObj = function(gameObject) {
  if (!(gameObject instanceof GameObject)) {
    console.warn('Object passed to attackObj was not a GameObject.');
    return;
  }
  var cmd = this._attackObj(gameObject.ref);
  netGame.attackObj(gameObject.serverObjectIdx);
  return cmd;
};

ActorObject.prototype.setDirection = function(radians) {
  this.direction = mod(radians, (Math.PI * 2));
  this.emit('moved');
};

ActorObject.prototype.update = function(delta) {
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
