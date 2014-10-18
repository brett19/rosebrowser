var MoCommand = require('./command');
var MoveToObjCmd = require('./movetoobj');

function _AttackCmd(object, targetObjRef) {
  MoCommand.call(this, object);
  this.pawn = this.object.pawn;
  this.target = targetObjRef;
}
_AttackCmd.prototype = Object.create(MoCommand.prototype);

_AttackCmd.prototype.enter = function() {
  this.pawn.playAttackMotion(this._attackDone.bind(this));
};

_AttackCmd.prototype._attackDone = function() {
  this.isComplete = true;
  this.emit('finish');
};

_AttackCmd.prototype.leave = function() {
};

_AttackCmd.prototype.update = function(delta) {
  return 0;
};


function AttackCmd(object, targetObjRef) {
  MoCommand.call(this, object);
  this.target = targetObjRef;
  this.activeCmd = null;
}
AttackCmd.prototype = Object.create(MoCommand.prototype);

AttackCmd.prototype.enter = function() {
  this._goOnce();
};

AttackCmd.prototype.leave = function() {
  if (this.activeCmd) {
    this.activeCmd._leave();
    this.activeCmd = null;
  }
};

AttackCmd.prototype._goOnce = function() {
  // Interupt here, as you cannot interupt in the middle of attack animation.
  if (this.wantInterrupt) {
    this.isComplete = true;
    return;
  }

  this.activeCmd = new MoveToObjCmd(this.object, this.target, this.object.stats.getAttackDistance());
  this.activeCmd.on('finish', function() {
    if (!this.activeCmd) {
      return;
    }
    this.activeCmd._leave();
    this.activeCmd = new _AttackCmd(this.object, this.target);
    this.activeCmd.on('finish', function() {
      if (!this.activeCmd) {
        return;
      }
      this.activeCmd._leave();
      this.activeCmd = null;
      this._goOnce();
    }.bind(this));
    this.activeCmd._enter();
  }.bind(this));
  this.activeCmd._enter();
};

AttackCmd.prototype.update = function(delta) {
  if (this.wantInterrupt && !(this.activeCmd instanceof _AttackCmd)) {
    this.isComplete = true;
    return delta;
  }

  // If object went offscreen or died, stop attacking!
  if (!this.target.object) {
    this.isComplete = true;
    return delta;
  }

  if (!this.activeCmd) {
    // This is really an error condition, we eat the delta to make sure
    //   we don't loop forever in the caller loop.
    return 0;
  }

  return this.activeCmd.update(delta);
};

module.exports = AttackCmd;
