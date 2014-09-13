'use strict';

var iop = io();
var socketList = [];

function RSocket() {
  EventEmitter.call(this);

  this.index = socketList.length;
  socketList.push(this);
  this.eventHandlers = {};
}
RSocket.prototype = new EventEmitter();

RSocket.prototype.connect = function(host, port) {
  iop.emit('tc', this.index, host, port);
};

RSocket.prototype.send = function(data) {
  iop.emit('tp', this.index, data);
};

RSocket.prototype.end = function() {
  iop.emit('tx', this.index);
};

iop.on('tc', function(sockIdx) {
  socketList[sockIdx].emit('connect');
});
iop.on('tp', function(sockIdx, data) {
  socketList[sockIdx].emit('data', new Uint8Array(data));
});
iop.on('tx', function(sockIdx) {
  socketList[sockIdx].emit('end');
});
