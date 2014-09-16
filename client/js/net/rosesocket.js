'use strict';

function logPacket(text, pak) {
  console.groupCollapsed(text + ' <Packet ' + pak.cmd.toString(16) + '>');
  console.log(_ppBuffer(pak.data, pak.dataLength));
  console.groupEnd();
}

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
          headerLen = 0;
          dataLen = 0;
          pakBuf = null;
        }
      }
    }
  });
}
RoseSocket.prototype = new RSocket();
RoseSocket.prototype.sendPacket = function(pak) {
  if (this.logIgnoreCmds.indexOf(pak.cmd) === -1) {
    logPacket('net:send<' + this.name + '>', pak);
  }
  var buf = pak.toBuffer();
  buf[2] ^= 0x61;
  buf[3] ^= 0x61;
  for (var i = 6; i < buf.length - 2; ++i) {
    buf[i] ^= 0x61;
  }
  this.send(buf.buffer);
};
