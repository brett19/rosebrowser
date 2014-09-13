'use strict';

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
  var res = this.buffer[this.pos+3] << 24 |
            this.buffer[this.pos+2] << 16 |
            this.buffer[this.pos+1] << 8 |
            this.buffer[this.pos+0];
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
  var strArray = this.buffer.subarray(this.pos, this.pos + len);
  this.pos += len;
  return String.fromCharCode.apply(null, strArray);
};

BinaryReader.prototype.readBytes = function(len) {
  var array = this.buffer.subarray(this.pos, this.pos + len);
  this.pos += len;
  return array;
};

BinaryReader.prototype.readByteStr = function() {
  return this.readStrLen(this.readUint8());
};

BinaryReader.prototype.readUint32Str = function() {
  return this.readStrLen(this.readUint32());
};

BinaryReader.prototype.tell = function() {
  return this.pos;
};

BinaryReader.prototype.seek = function(pos) {
  this.pos = pos;
};

BinaryReader.prototype.skip = function(num) {
  this.pos += num;
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

BinaryReader.prototype.readColourRGBA = function() {
  var r = this.readFloat();
  var g = this.readFloat();
  var b = this.readFloat();
  var a = this.readFloat();
  return { r: r, g: g, b: b, a: a };
};

BinaryReader.prototype.readQuat = function() {
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  var w = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};

BinaryReader.prototype.readBadQuat = function() {
  var w = this.readFloat();
  var x = this.readFloat();
  var y = this.readFloat();
  var z = this.readFloat();
  return new THREE.Quaternion(x, y, z, w);
};
