/**
 * The base class for all states within the application.
 * @constructor
 */
function State() {
}

/**
 * Preparation handler called once per application.
 * @param callback
 */
State.prototype.prepareOnce = function(callback) {
  callback();
};

/**
 * Preparation handler called prior to every entry into the state.
 * @param callback
 */
State.prototype.prepare = function(callback) {
  callback();
};

/**
 * Called when the state is being entered.
 */
State.prototype.enter = function() {
};

/**
 * Called when the state is being left.
 */
State.prototype.leave = function() {
};

/**
 * Called every frame while the state is active.
 */
State.prototype.update = function(delta) {
};

module.exports = State;
