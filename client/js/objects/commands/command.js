'use strict';

function MoCommand(object) {
  this.object = object;
  this.isComplete = false;
  this.wantInterrupt = false;
}

MoCommand.prototype.enter = function() {
};

MoCommand.prototype.leave = function() {
};
