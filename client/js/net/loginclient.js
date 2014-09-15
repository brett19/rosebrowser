'use strict';

var NETLOGINREPLY = {
  OK: 0,
  Failed: 1,
  InvalidUsername: 2,
  InvalidPassword: 3,
  AlreadyLoggedIn: 4,
  RefusedAccount: 5,
  NeedCharge: 6,
  NoRights: 7,
  Overloaded: 8,
  NoRealName: 9,
  BadVersion: 10,
  OutOfIp: 11
};

function LoginClient() {
  this.socket = new RoseSocket();
  this.socket.name = 'ls';
  this.socket.on('connect', function() {
    console.log('LoginClient connected');
  });
  this.socket.on('end', function() {
    console.log('LoginClient ended');
  });
}

LoginClient.prototype.son = function(event, handler) {
  var self = this;
  var interHandler = function() {
    if (!handler.apply(self, arguments)) {
      self.socket.removeEventListener(event, interHandler);
    }
  };
  this.socket.addEventListener(event, interHandler);
};

LoginClient.prototype.connect = function(host, port, callback) {
  this.socket.connect(host, port);
  this.son('connect', function() {
    var pak = new RosePacket(0x703);
    this.socket.sendPacket(pak);
    this.son('packet', function(pak) {
      if (pak.cmd !== 0x7ff) {
        console.log('received unexpected preconn packet');
        return true;
      }
      callback();
    });
  });
};
LoginClient.prototype.end = function() {
  this.socket.end();
};

LoginClient.prototype.login = function(username, password, callback) {
  var opak = new RosePacket(0x708);
  opak.addString(CryptoJS.MD5(password).toString(CryptoJS.enc.Hex), true);
  opak.addString(username);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x708) {
      console.log('received unexpected prelog packet');
      return true;
    }

    var data = {};
    data.result = pak.readUint8();
    data.right = pak.readUint16();
    data.payType = pak.readUint16();
    data.servers = [];
    while (!pak.isReadEof()) {
      var srvdata = {};
      srvdata.name = pak.readString();
      srvdata.id = pak.readUint32();
      data.servers.push(srvdata);
    }
    callback(data);
  });
};

LoginClient.prototype.channelList = function(serverId, callback) {
  var opak = new RosePacket(0x704);
  opak.addUint32(serverId);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x704) {
      return true;
    }
    if (pak.getUint32(0) !== serverId) {
      return true;
    }

    var data = {};
    /*serverId*/ pak.readUint32();
    var channelCount = pak.readUint8();
    data.channels = [];
    for (var i = 0; i < channelCount; ++i) {
      var chdata = {};
      chdata.id = pak.readUint8();
      chdata.lowAge = pak.readUint8();
      chdata.highAge = pak.readUint8();
      chdata.userPercent = pak.readInt16();
      chdata.name = pak.readString();
      data.channels.push(chdata);
    }
    callback(data);
  });
};

LoginClient.prototype.selectServer = function(serverId, channelId, callback) {
  var opak = new RosePacket(0x70a);
  opak.addUint32(serverId);
  opak.addUint8(channelId);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x70a) {
      return true;
    }

    var data = {};
    data.result = pak.readUint8();
    data.transferKey1 = pak.readUint32();
    data.transferKey2 = pak.readUint32();
    data.worldIp = pak.readString();
    data.worldPort = pak.readUint16();
    callback(data);
  });
};

var netLogin = null;
