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
function SitCmd(object) {
  MoCommand.call(this, object);
  this.ending = false;
}
SitCmd.prototype = Object.create(MoCommand.prototype);

SitCmd.prototype.enter = function() {
  this.object.pawn.playSitDownMotion(this._sitDownDone.bind(this));
};

SitCmd.prototype._sitDownDone = function() {
  this.object.pawn.playSittingMotion();
};

SitCmd.prototype.beginLeave = function() {
  this.object.pawn.playStandUpMotion(this._standUpDone.bind(this));
};

SitCmd.prototype._standUpDone = function() {
  this.isComplete = true;
  this.emit('finish');
};

SitCmd.prototype.leave = function() {
};

SitCmd.prototype.update = function(delta) {
  if (this.wantInterrupt && !this.ending) {
    this.ending = true;
    this.beginLeave();
  }
  return 0;
};

module.exports = SitCmd;
