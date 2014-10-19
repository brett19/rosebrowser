/**
 * @constructor
 */
function EventEmitter() {
  this.eventHandlers = {};
}

EventEmitter.prototype.clearEventListeners = function() {
  this.eventHandlers = {};
};

EventEmitter.prototype.emit = function(event) {
  if (!this.eventHandlers[event]) {
    return;
  }

  var argsOut = [];
  for (var i = 1; i < arguments.length; ++i) {
    argsOut.push(arguments[i]);
  }

  for (var j = 0; j < this.eventHandlers[event].length; ++j) {
    this.eventHandlers[event][j].apply(this, argsOut);
  }
};

EventEmitter.prototype.addEventListener = function(event, handler) {
  if (!this.eventHandlers[event]) {
    this.eventHandlers[event] = [];
  }

  this.eventHandlers[event].push(handler);
  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;

EventEmitter.prototype.removeEventListener = function(event, handler) {
  if (!this.eventHandlers[event]) {
    return false;
  }

  var handlerIdx = this.eventHandlers[event].indexOf(handler);
  if (handlerIdx !== -1) {
    this.eventHandlers[event].splice(handlerIdx, 1);
    return true;
  }

  return false;
};

EventEmitter.prototype.once = function(event, handler) {
  var onceHandler = function() {
    this.removeEventListener(event, onceHandler);
    handler.apply(this, arguments);
  }.bind(this);

  this.addEventListener(event, onceHandler);
  return this;
};

module.exports = EventEmitter;
