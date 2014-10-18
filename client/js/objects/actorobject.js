var GORef = require('./goref');
var GameObject = require('./gameobject');
var StopCmd = require('./commands/stop');
var MoveToPosCmd = require('./commands/movetopos');
var MoveToObjCmd = require('./commands/movetoobj');
var AttackCmd = require('./commands/attack');

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

ActorObject.prototype.setVisible = function(visible) {
  this.pawn.rootObj.visible = visible;
};

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

ActorObject.prototype._stop = function() {
  return this._setNextCmd(new StopCmd(this));
};

ActorObject.prototype._moveTo = function(x, y) {
  return this._setNextCmd(new MoveToPosCmd(this, new THREE.Vector2(x, y)));
};

ActorObject.prototype._moveToObj = function(objectRef, distance) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _moveToObj was not a GORef.');
    return;
  }
  return this._setNextCmd(new MoveToObjCmd(this, objectRef, distance));
};

ActorObject.prototype._attackObj = function(objectRef) {
  if (!(objectRef instanceof GORef)) {
    console.warn('Reference passed to _attackObj was not a GORef.');
    return;
  }
  return this._setNextCmd(new AttackCmd(this, objectRef));
};

ActorObject.prototype.setDirection = function(radians) {
  this.direction = radians;
  this.emit('moved');
};

ActorObject.prototype.update = function(delta) {
  var deltaLeft = delta;
  while (deltaLeft > EPSILON) {
    if (!this.activeCmd) {
      if (!this.nextCmd) {
        this.nextCmd = new StopCmd(this);
      }

      this.activeCmd = this.nextCmd;
      this.nextCmd = null;
      this.activeCmd._enter();
    }

    deltaLeft = this.activeCmd.update(deltaLeft);

    if (this.activeCmd.isComplete) {
      this.activeCmd._leave();
      this.activeCmd = null;
    }
  }

  if (this.pawn) {
    this.pawn.setDirection(this.direction);
  }
  return GameObject.prototype.update.call(this, delta);
};

module.exports = ActorObject;
