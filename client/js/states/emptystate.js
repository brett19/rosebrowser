var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function EmptyState() {
  State.call(this);
}
EmptyState.prototype = new State();

EmptyState.prototype.prepare = function(callback) {
  callback();
};

EmptyState.prototype.enter = function() {
};

EmptyState.prototype.leave = function() {
};

EmptyState.prototype.update = function(delta) {
};

StateManager.register('empty', EmptyState);
