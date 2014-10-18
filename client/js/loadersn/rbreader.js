'use strict';

function RbReader(buffer) {
  this.pos = 0;
  this.buffer = buffer;
  this.floatData = new Float32Array(buffer, 0, buffer.byteLength>>2);
  this.uint32Data = new Uint32Array(buffer, 0, buffer.byteLength>>2);
  this.uint8Data = new Uint8Array(buffer);
}

RbReader.prototype.getRegion = function(type, start, length) {
  return new type(this.buffer, start, length / type.BYTES_PER_ELEMENT);
};

RbReader.prototype.getFloat = function(pos) {
  if (pos & 3) {
    throw new Error('Tried to read unaligned Uint32');
  }
  return this.floatData[pos >> 2];
};

RbReader.prototype.getUint32 = function(pos) {
  if (pos & 3) {
    throw new Error('Tried to read unaligned Uint32');
  }
  return this.uint32Data[pos >> 2];
};

RbReader.prototype.seek = function(pos) {
  this.pos = pos;
};

RbReader.prototype.readRegion = function(type, length) {
  var val = this.getRegion(type, this.pos, length);
  this.pos += length;
  return val;
};

RbReader.prototype.readFloat = function() {
  var val = this.getFloat(this.pos);
  this.pos += 4;
  return val;
}

RbReader.prototype.readUint32 = function() {
  var val = this.getUint32(this.pos);
  this.pos += 4;
  return val;
};

RbReader.prototype.readUint16Str = function() {
  var strLen = this.uint8Data[this.pos+1] << 8 | this.uint8Data[this.pos];
  this.pos += 2;
  var strData = this.uint8Data.subarray(this.pos, this.pos + strLen);
  this.pos += strLen;
  return String.fromCharCode.apply(null, strData);
};
