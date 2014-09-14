'use strict';

function _ppBuffer(buf, buflen) {
  var out = '';
  for (var i = 0; i < buflen; ++i) {
    if (i>0) out += ' ';
    var byte = buf[i].toString(16);
    if (byte.length < 2) {
      byte = '0' + byte;
    }
    out += byte;
  }
  return out;
}
function ppPak(pak) {
  var out = '<Packet ';
  out += pak.cmd.toString(16) + ' - ';
  out += _ppBuffer(pak.data, pak.dataLength);
  return out + '>';
}

function RosePacket(cmd) {
  this.cmd = cmd;
  this.dataLength = 0;
  this.data = new Uint8Array(4096);
  this.readPos = 0;
  this.view = new DataView(this.data.buffer);
}

RosePacket.prototype.setInt8 = function(pos, val) {
  this.view.setInt8(pos, val);
};
RosePacket.prototype.setInt16 = function(pos, val) {
  this.view.setInt16(pos, val, true);
};
RosePacket.prototype.setInt32 = function(pos, val) {
  this.view.setInt32(pos, val, true);
};
RosePacket.prototype.setUint8 = function(pos, val) {
  this.view.setUint8(pos, val);
};
RosePacket.prototype.setUint16 = function(pos, val) {
  this.view.setUint16(pos, val, true);
};
RosePacket.prototype.setUint32 = function(pos, val) {
  this.view.setUint32(pos, val, true);
};

RosePacket.prototype.addInt8 = function(val) {
  this.view.setInt8(this.dataLength, val);
  this.dataLength += 1;
};
RosePacket.prototype.addInt16 = function(val) {
  this.view.setInt16(this.dataLength, val, true);
  this.dataLength += 2;
};
RosePacket.prototype.addInt32 = function(val) {
  this.view.setInt32(this.dataLength, val, true);
  this.dataLength += 4;
};
RosePacket.prototype.addUint8 = function(val) {
  this.view.setUint8(this.dataLength, val);
  this.dataLength += 1;
};
RosePacket.prototype.addUint16 = function(val) {
  this.view.setUint16(this.dataLength, val, true);
  this.dataLength += 2;
};
RosePacket.prototype.addUint32 = function(val) {
  this.view.setUint32(this.dataLength, val, true);
  this.dataLength += 4;
};
RosePacket.prototype.addString = function(val, noNullTerm) {
  for (var i = 0; i < val.length; i++) {
    this.addUint8(val.charCodeAt(i) & 0xFF);
  }
  if (!noNullTerm) {
    this.addUint8(0);
  }
};

RosePacket.prototype.getInt8 = function(pos) {
  return this.view.getInt8(pos);
};
RosePacket.prototype.getInt16 = function(pos) {
  return this.view.getInt16(pos, true);
};
RosePacket.prototype.getInt32 = function(pos) {
  return this.view.getInt32(pos, true);
};
RosePacket.prototype.getUint8 = function(pos) {
  return this.view.getUint8(pos, true);
};
RosePacket.prototype.getUint16 = function(pos) {
  return this.view.getUint16(pos, true);
};
RosePacket.prototype.getUint32 = function(pos) {
  return this.view.getUint32(pos, true);
};

RosePacket.prototype.skip = function(num) {
  this.readPos += num;
};
RosePacket.prototype.readInt8 = function() {
  var val = this.view.getInt8(this.readPos);
  this.readPos += 1;
  return val;
};
RosePacket.prototype.readInt16 = function() {
  var val = this.view.getInt16(this.readPos, true);
  this.readPos += 2;
  return val;
};
RosePacket.prototype.readInt32 = function() {
  var val = this.view.getInt32(this.readPos, true);
  this.readPos += 4;
  return val;
};
RosePacket.prototype.readUint8 = function() {
  var val = this.view.getUint8(this.readPos, true);
  this.readPos += 1;
  return val;
};
RosePacket.prototype.readUint16 = function() {
  var val = this.view.getUint16(this.readPos, true);
  this.readPos += 2;
  return val;
};
RosePacket.prototype.readUint32 = function() {
  var val = this.view.getUint32(this.readPos, true);
  this.readPos += 4;
  return val;
};
RosePacket.prototype.readUint64 = function() {
  var lo = this.readUint32();
  var hi = this.readUint32();
  return [lo, hi];
};
RosePacket.prototype.readFloat = function() {
  var val = this.view.getFloat32(this.readPos, true);
  this.readPos += 4;
  return val;
};
RosePacket.prototype.readVector2 = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  return new THREE.Vector2(x, y);
};
RosePacket.prototype.readPartItem = function() {
  var item = {};
  item.itemNo = this.readUint32();
  item.gemOption1 = this.readUint16();
  item.gemOption2 = this.readUint16();
  item.gemOption3 = this.readUint16();
  item.socketCount = this.readUint8();
  item.refineGrade = this.readUint16();
  item.color = this.readUint32();
  return item;
};
RosePacket.prototype.readItem = function() {
  var item = {};
  item.itemKey = this.readUint64();
  item.isCrafted = this.readUint8();
  item.gemOption1 = this.readUint16();
  item.gemOption2 = this.readUint16();
  item.gemOption3 = this.readUint16();
  item.durability = this.readUint16();
  item.itemLife = this.readUint16();
  item.socketCount = this.readUint8();
  item.isAppraised = this.readUint8();
  item.refineGrade = this.readUint16();
  item.quantity = this.readUint16();
  item.location = this.readUint8();
  item.slotNo = this.readUint32();
  /*pickupTime*/ this.skip(14);
  item.timeRemaining = this.readUint32();
  item.moveLImits = this.readUint16();
  item.bindOnAcquire = this.readUint8();
  item.bindOnEquipUse = this.readUint8();
  item.money = this.readUint32();
  return item;
};
RosePacket.prototype.readString = function() {
  var startPos = this.readPos;
  while (this.readUint8());
  var strArray = this.data.subarray(startPos, this.readPos - 1);
  return String.fromCharCode.apply(null, strArray);
};

RosePacket.prototype.isReadEof = function() {
  return this.readPos >= this.dataLength;
};

RosePacket.prototype.toBuffer = function() {
  var outBuf = new Uint8Array(6 + this.dataLength);
  var outView = new DataView(outBuf.buffer);
  outView.setUint16(0, outBuf.length, true);
  outView.setUint16(2, this.cmd, true);
  if (this.cmd === 0x703 || this.cmd === 0x712) {
    outView.setUint16(4, 0x58d1, true);
  } else {
    outView.setUint16(4, 0x39b0, true);
  }
  for (var i = 0; i < this.dataLength; ++i) {
    outBuf[6+i] = this.data[i];
  }
  return outBuf;
};
