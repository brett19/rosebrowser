'use strict';

// TODO: readIntX using this.buffer

/**
 * @constructor
 */
var BinaryReader = function(arrayBuffer) {
  this.buffer = new Uint8Array(arrayBuffer);
  this.view = new DataView(arrayBuffer);
  this.pos = 0;
};

BinaryReader.prototype.readFloat = function() {
  var res = this.view.getFloat32(this.pos, true);
  this.pos += 4;
  return res;
};

BinaryReader.prototype.readUint8 = function() {
  return this.buffer[this.pos++];
};

BinaryReader.prototype.readUint16 = function() {
  var res = this.buffer[this.pos+1] << 8 |
            this.buffer[this.pos+0];
  this.pos += 2;
  return res;
};

BinaryReader.prototype.readUint24 = function() {
  var res = this.buffer[this.pos+2] << 16 |
            this.buffer[this.pos+1] << 8 |
            this.buffer[this.pos+0];
  this.pos += 3;
  return res;
};

BinaryReader.prototype.readUint32 = function() {
  var res = (this.buffer[this.pos+3] << 24 |
             this.buffer[this.pos+2] << 16 |
             this.buffer[this.pos+1] << 8 |
             this.buffer[this.pos+0]) >>> 0;
  this.pos += 4;
  return res;
};

BinaryReader.prototype.readInt8 = function() {
  var res = this.view.getInt8(this.pos);
  this.pos += 1;
  return res;
};

BinaryReader.prototype.readInt16 = function() {
  var res = this.view.getInt16(this.pos, true);
  this.pos += 2;
  return res;
};

BinaryReader.prototype.readInt32 = function() {
  var res = this.view.getInt32(this.pos, true);
  this.pos += 4;
  return res;
};

BinaryReader.prototype.readStr = function() {
  var startPos = this.pos;
  while (this.buffer[this.pos++]);
  var strArray = this.buffer.subarray(startPos, this.pos - 1);
  return String.fromCharCode.apply(null, strArray);
};

BinaryReader.prototype.readStrLen = function(len) {
  var realStrLen;
  for (realStrLen = 0; realStrLen < len; realStrLen++) {
    if (this.buffer[this.pos+realStrLen] === 0) break;
  }
  var strArray = this.buffer.subarray(this.pos, this.pos + realStrLen);
  this.pos += len;
  return String.fromCharCode.apply(null, strArray);
};

BinaryReader.prototype.readUint8Array = function(len) {
  var array = new Uint8Array(this.buffer.buffer, this.pos, len);
  this.pos += len;
  return array;
};

BinaryReader.prototype.readUint16Array = function(len) {
  if ((this.pos % 2) === 0) {
    var array = new Uint16Array(this.buffer.buffer, this.pos, len);
    this.pos += len * 2;
    return array;
  } else {
    var buffer = new Uint8Array(this.readUint8Array(len * 2));
    return new Uint16Array(buffer.buffer, 0, len);
  }
};

BinaryReader.prototype.readUint32Array = function(len) {
  if ((this.pos % 4) === 0) {
    var array = new Uint32Array(this.buffer.buffer, this.pos, len);
    this.pos += len * 4;
    return array;
  } else {
    var buffer = new Uint8Array(this.readUint8Array(len * 4));
    return new Uint32Array(buffer.buffer, 0, len);
  }
};

BinaryReader.prototype.readFloatArray = function(len) {
  if ((this.pos % 4) === 0) {
    var array = new Float32Array(this.buffer.buffer, this.pos, len);
    this.pos += len * 4;
    return array;
  } else {
    var buffer = new Uint8Array(this.readUint8Array(len * 4));
    return new Float32Array(buffer.buffer, 0, len);
  }
};

BinaryReader.prototype.readUint8Str = function() {
  return this.readStrLen(this.readUint8());
};

BinaryReader.prototype.readUint16Str = function() {
  return this.readStrLen(this.readUint16());
};

BinaryReader.prototype.readUint32Str = function() {
  return this.readStrLen(this.readUint32());
};

BinaryReader.prototype.readVarLengthStr = function() {
  var chr = this.readUint8();
  var length = chr & 0x7f;
  var shift = 7;

  while (chr & 0x80) {
    chr = this.readUint8();
    length |= (chr & 0x7f) << shift;
    shift += 7;
  }

  return this.readStrLen(length);
};

BinaryReader.prototype.tell = function() {
  return this.pos;
};

BinaryReader.prototype.seek = function(pos) {
  if (pos >= 0) {
    this.pos = pos;
  } else {
    this.pos = this.buffer.byteLength + pos;
  }
};

BinaryReader.prototype.skip = function(num) {
  this.pos += num;
};

BinaryReader.prototype.readIntVector2 = function() {
  var x = this.readInt32();
  var y = this.readInt32();
  return new THREE.Vector2(x, y);
};

BinaryReader.prototype.readVector2 = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  return new THREE.Vector2(x, y);
};

BinaryReader.prototype.readVector3 = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  return new THREE.Vector3(x, y, z);
};

BinaryReader.prototype.readVector3xzy = function() {
  var x = this.readFloat();
  var z = this.readFloat();
  var y = this.readFloat();
  return new THREE.Vector3(x, y, z);
};

BinaryReader.prototype.readMatrix4 = function() {
  var out = new THREE.Matrix4();
  for (var i = 0; i < 16; ++i) {
    out.elements[i] = this.readFloat();
  }
  return out;
};

BinaryReader.prototype.readColour = function() {
  var r = this.readFloat();
  var g = this.readFloat();
  var b = this.readFloat();
  return new THREE.Color(r, g, b);
};

BinaryReader.prototype.readColor4 = function() {
  var r = this.readFloat();
  var g = this.readFloat();
  var b = this.readFloat();
  var a = this.readFloat();
  return new Color4(r, g, b, a);
};

BinaryReader.prototype.readQuat = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  var w = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};

BinaryReader.prototype.readQuatwxyz = function() {
  var w = this.readFloat();
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};

module.exports = BinaryReader;
