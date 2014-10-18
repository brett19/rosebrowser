var State = require('./state');

/**
 * A class for managing game states and the transitions between them.
 *
 * @constructor
 */
function _StateManager() {
  this._states = {};
  this._activeState = null;
}

/**
 * Registers a new state.
 *
 * @param name
 * The name of this state.
 * @param classFunc
 * The class that runs this state.
 */
_StateManager.prototype.register = function(name, classFunc) {
  if (this._states[name]) {
    console.warn('Two states registered with the same name!');
    return;
  }

  for (var i in this._states) {
    if (this._states.hasOwnProperty(i)) {
      if (this._states[i] instanceof classFunc) {
        throw new Error('Two states registered with the same type!');
      }
    }
  }

  var stateInstance = new classFunc();
  if (!(stateInstance instanceof State)) {
    console.warn('Registered state does not inherit from base state.');
  }

  stateInstance.__isPrepared = false;
  stateInstance.__isPrepareOnced = false;
  this._states[name] = stateInstance;
};

/**
 * Retrieves a state by name.
 *
 * @param name
 * @returns {*}
 */
_StateManager.prototype.get = function(name) {
  if (!this._states[name]) {
    throw new Error('Attempted to retrieve unregistered state.');
  }
  return this._states[name];
};

_StateManager.prototype.prepare = function(name, callback) {
  var state = this._states[name];
  if (!state) {
    throw new Error('Attempted to prepare an unregistered state.');
  }

  if (!state.__isPrepareOnced) {
    state.prepareOnce(function() {
      state.__isPrepareOnced = true;
      doPrepare();
    })
  } else {
    doPrepare();
  }

  function doPrepare() {
    if (!state.__isPrepared) {
      state.prepare(function() {
        state.__isPrepared = true;
        if (callback) {
          callback();
        }
      })
    } else {
      if (callback) {
        callback();
      }
    }
  }
};

_StateManager.prototype.switch = function(name) {
  var state = this._states[name];
  if (!state) {
    throw new Error('Attempted to switch to an unregistered state.');
  }

  if (!state.__isPrepared) {
    throw new Error('Attempted to switch to an unprepared state.');
  }

  if (this._activeState) {
    this._activeState.leave();
    this._activeState.__isPrepared = false;
  }

  this._activeState = state;
  this._activeState.enter();
};

_StateManager.prototype.prepareAndSwitch = function(name, callback) {
  this.prepare(name, function() {
    this.switch(name);
    if (callback) {
      callback();
    }
  }.bind(this));
};

_StateManager.prototype.update = function(delta) {
  if (this._activeState) {
    this._activeState.update(delta);
  }
};

/**
 * @global
 * @type {_StateManager}
 */
var StateManager = new _StateManager();
module.exports = StateManager;
