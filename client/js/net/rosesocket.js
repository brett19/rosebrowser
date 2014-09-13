'use strict';

function RoseSocket() {
  RSocket.call(this);

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
            console.log('got a packet!', ppPak(pakBuf));
            this._emit('packet', pakBuf);
            headerLen = 0;
            dataLen = 0;
            pakBuf = null;
          }
        }
      } else {
        pakBuf.data[pakBuf.dataLength++] = data[i];

        if (pakBuf.dataLength === dataLen) {
          console.log('got a packet!', ppPak(pakBuf));
          this._emit('packet', pakBuf);
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
  console.log('sending packet!', ppPak(pak));
  var buf = pak.toBuffer();
  buf[2] ^= 0x61;
  buf[3] ^= 0x61;
  for (var i = 6; i < buf.length - 2; ++i) {
    buf[i] ^= 0x61;
  }
  this.send(buf.buffer);
};
