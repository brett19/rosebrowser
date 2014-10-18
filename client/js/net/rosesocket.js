var RSocket = require('./socket');
var RosePacket = require('./rosepacket');

function logPacket(text, pak) {
  if (!config.fullPacketData) {
    var pakDataStr = '';
    if (pak.dataLength > 32) {
      pakDataStr = pak.toString(32) + ' ...';
    } else {
      pakDataStr = pak.toString(pak.dataLength);
    }
    netConsole.debug(text + ' <Packet ' + pak.cmd.toString(16) + ' ' + pakDataStr + '>');
  } else {
    netConsole.groupCollapsed(text + ' <Packet ' + pak.cmd.toString(16) + '>');
    netConsole.debug(pak.toString(pak.dataLength));
    netConsole.groupEnd();
  }
}

function _checkPacket(pak) {
  if (pak.readPos > 0 && pak.readPos !== pak.dataLength) {
    console.warn('Packet not read properly (cmd:' + pak.cmd.toString(16) + ' length:' + pak.dataLength + ' read:' + pak.readPos + ').');
  }
}

/**
 * @constructor
 */
function RoseSocket() {
  RSocket.call(this);

  this.name = '';
  this.logIgnoreCmds = [];

  var headerBuf = new Uint8Array(6);
  var headerView = new DataView(headerBuf.buffer);
  var headerLen = 0;
  var dataLen = 0;
  var pakBuf = null;

  this.on('data', function(data) {
    for (var i = 0; i < data.length; ++i) {
      if (!pakBuf) {
        if (headerLen < 6) {
          headerBuf[headerLen++] = data[i];
        }
        if (headerLen === 6) {
          pakBuf = new RosePacket(0);
          dataLen = headerView.getUint16(0, true) - 6;
          pakBuf.cmd = headerView.getUint16(2, true);

          if (dataLen === 0) {
            if (this.logIgnoreCmds.indexOf(pakBuf.cmd) === -1) {
              logPacket('net:recv', pakBuf);
            }
            this.emit('packet', pakBuf);
            _checkPacket(pakBuf);
            headerLen = 0;
            dataLen = 0;
            pakBuf = null;
          }
        }
      } else {
        pakBuf.data[pakBuf.dataLength++] = data[i];

        if (pakBuf.dataLength === dataLen) {
          if (this.logIgnoreCmds.indexOf(pakBuf.cmd) === -1) {
            logPacket('net:recv<' + this.name + '>', pakBuf);
          }
          this.emit('packet', pakBuf);
          _checkPacket(pakBuf);
          headerLen = 0;
          dataLen = 0;
          pakBuf = null;
        }
      }
    }
  });
}
RoseSocket.prototype = Object.create(RSocket.prototype);

RoseSocket.prototype.sendPacket = function(pak) {
  if (this.logIgnoreCmds.indexOf(pak.cmd) === -1) {
    logPacket('net:send<' + this.name + '>', pak);
  }
  var buf = pak.toBuffer();
  for (var i = 2; i < buf.length - 2; ++i) {
    buf[i] ^= 0x61;
  }
  this.send(buf.buffer);
};

module.exports = RoseSocket;
