'use strict';

function WorldClient() {
  EventEmitter.call(this);

  this.socket = new RoseSocket();
  this.socket.name = 'ws';
  this.socket.on('connect', function() {
    console.log('WorldClient connected');
  });
  this.socket.on('end', function() {
    console.log('WorldClient ended');
  });
}
WorldClient.prototype = new EventEmitter();

WorldClient.prototype.son = function(event, handler) {
  var self = this;
  var interHandler = function() {
    if (!handler.apply(self, arguments)) {
      self.socket.removeEventListener(event, interHandler);
    }
  };
  this.socket.addEventListener(event, interHandler);
};

WorldClient.prototype.connect = function(host, port, transferKey, password, callback) {
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
WorldClient.prototype.end = function() {
  this.socket.end();
};

WorldClient.prototype.characterList = function(callback) {
  var opak = new RosePacket(0x712);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x712) {
      return true;
    }

    var data = {};
    var charCount = pak.readUint8();
    data.characters = [];
    for (var i = 0; i < charCount; ++i) {
      var chdata = {};
      chdata.name = pak.readString();
      chdata.gender = pak.readUint8();
      chdata.hairColor = pak.readUint8();
      chdata.level = pak.readInt16();
      chdata.job = pak.readInt16();
      chdata.zone = pak.readUint32();
      chdata.remainTime = pak.readUint32();
      chdata.nameChangeFlag = pak.readUint8();
      chdata.parts = [];
      for (var j = 0; j < AVTBODYPART.Max; ++j) {
        chdata.parts.push(pak.readPartItem());
      }

      data.characters.push(chdata);
    }
    callback(data);
  });
};

WorldClient.prototype.selectCharacter = function(charName, callback) {
  var opak = new RosePacket(0x715);
  opak.addUint8(0);
  opak.addUint8(0x6d);
  opak.addUint8(0x16);
  opak.addString(charName);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x711) {
      return true;
    }

    var data = {};
    data.gamePort = pak.readUint16();
    data.transferKey1 = pak.readUint32();
    data.transferKey2 = pak.readUint32();
    data.gameIp = pak.readString();
    callback(data);
  });
};

var netWorld = null;
