'use strict';

function GameClient() {
  this.socket = new RoseSocket();
  this.socket.name = 'gs';
  this.socket.on('connect', function() {
    console.log('GameClient connected');
  });
  this.socket.on('end', function() {
    console.log('GameClient ended');
  });
}

GameClient.prototype.son = function(event, handler) {
  var self = this;
  var interHandler = function() {
    if (!handler.apply(self, arguments)) {
      self.socket.removeEventListener(event, interHandler);
    }
  };
  this.socket.addEventListener(event, interHandler);
};

GameClient.prototype.connect = function(host, port, transferKey, password, callback) {
  this.socket.connect(host, port);
  this.son('connect', function() {
    var pak = new RosePacket(0x70b);
    pak.addUint32(transferKey);
    pak.addString(CryptoJS.MD5(password).toString(CryptoJS.enc.Hex), true, true);
    this.socket.sendPacket(pak);
    this.son('packet', function(pak) {
      if (pak.cmd !== 0x70c) {
        console.log('received unexpected preconn packet');
        return true;
      }
      callback();
    });
  });
};
GameClient.prototype.end = function() {
  this.socket.end();
};
