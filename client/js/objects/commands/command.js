var EventEmitter = require('../../util/eventemitter');

function MoCommand(object) {
  EventEmitter.call(this);

  this.object = object;
  this.isComplete = false;
  this.wantInterrupt = false;
}
MoCommand.prototype = Object.create( EventEmitter.prototype );

MoCommand.prototype._enter = function() {
  this.emit('enter');
  this.enter();
};

MoCommand.prototype._leave = function() {
  this.leave();
  this.emit('leave');
};

MoCommand.prototype.enter = function() {
};

MoCommand.prototype.leave = function() {
};

module.exports = MoCommand;
