'use strict';

var iop = io();
var socketList = [];

function RSocket() {
  this.index = socketList.length;
  socketList.push(this);
  this.eventHandlers = {};
}
RSocket.prototype.connect = function(host, port) {
  iop.emit('tc', this.index, host, port);
};
RSocket.prototype.send = function(data) {
  iop.emit('tp', this.index, data);
};
RSocket.prototype._emit = function(event) {
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
RSocket.prototype.addEventListener = function(event, handler) {
  if (!this.eventHandlers[event]) {
    this.eventHandlers[event] = [];
  }
  this.eventHandlers[event].push(handler);
};
RSocket.prototype.on = RSocket.prototype.addEventListener;
RSocket.prototype.removeEventListener = function(event, handler) {
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
iop.on('tc', function(sockIdx) {
  socketList[sockIdx]._emit('connect');
});
iop.on('tp', function(sockIdx, data) {
  socketList[sockIdx]._emit('data', data);
});
