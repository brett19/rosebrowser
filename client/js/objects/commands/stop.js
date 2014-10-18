var MoCommand = require('./command');

/**
 * ActorObject command for handling stopping (play idle animation)
 *
 * @event enter When this command enters.
 * @event leave When this command leaves.
 * @event finish When we reach our target position.
 *
 * @param object
 * @constructor
 */
function StopCmd(object) {
  MoCommand.call(this, object);
}
StopCmd.prototype = Object.create(MoCommand.prototype);

StopCmd.prototype.enter = function() {
  this.object.pawn.playIdleMotion();
};

StopCmd.prototype.leave = function() {
};

StopCmd.prototype.update = function(delta) {
  if (this.wantInterrupt) {
    this.isComplete = true;
    return delta;
  }
  return 0;
};

module.exports = StopCmd;
