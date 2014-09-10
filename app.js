'use strict';

var http = require('http');
var path = require('path');
var stream = require('stream');
var fs = require('fs');
var mkdirp = require('mkdirp')
var BufferedStream = require('bufferedstream');
var express = require('express');

// Helper to read a whole stream into a Buffer object.
function streamToBuffer(sourceStream, callback) {
  var bufs = [];
  sourceStream.on('data', function(d){ bufs.push(d); });
  sourceStream.on('end', function() {
    callback(null, Buffer.concat(bufs));
  });
}


function BinaryReader(buffer) {
  this.buffer = buffer;
  this.pos = 0;
}
BinaryReader.prototype.readFloat = function() {
  var res = this.buffer.readFloatLE(this.pos);
  this.pos += 4;
  return res;
}
BinaryReader.prototype.readUint8 = function() {
  return this.buffer.readUInt8(this.pos++);
};
BinaryReader.prototype.readUint16 = function() {
  var res = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  return res;
};
BinaryReader.prototype.readUint32 = function() {
  var res = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  return res;
};
BinaryReader.prototype.readStr = function() {
  var startPos = this.pos;
  while (this.buffer[this.pos++]);
  var strArray = this.buffer.slice(startPos, this.pos-1);
  return strArray.toString('utf8');
};
BinaryReader.prototype.readStrLen = function(len) {
  var strArray = this.buffer.slice(this.pos, this.pos+len);
  this.pos += len;
  return strArray.toString('utf8');
};
BinaryReader.prototype.skip = function(num) {
  this.pos += num;
};


var SOURCE_LOCATION = 'http://home.br19.com:82/rosedata/';

// Data Stuffs
function Cacher() {
  this.path = __dirname + '/cache/';
}
Cacher.prototype.getSourceStream = function(filePath, callback) {
  http.request(SOURCE_LOCATION + filePath, function(lRes) {
    callback(null, lRes);
  }).end();
};
Cacher.prototype.getStream = function(filePath, callback) {
  var cacheFile = this.path + filePath;
  var cacheDir = path.dirname(cacheFile);

  var self = this;
  fs.exists(cacheFile, function(fileExists) {
    fileExists = false;
    if (fileExists) {
      var rs = fs.createReadStream(cacheFile);
      callback(null, rs)
    } else {
      mkdirp(cacheDir, function() {
        var ws = fs.createWriteStream(cacheFile);
        self.getSourceStream(filePath, function(err, stream) {
          stream.pipe(ws, {end: true});
          callback(err, stream);
        });
      });
    }
  });
};




var app = express();

// Static Client Data
app.use(express.static(__dirname + '/client'));

var cache = new Cacher();

app.use('/data/*', function(req, res) {
  cache.getStream(req.baseUrl.substr(6), function(err, sourceStream) {
    sourceStream.pipe(res, {end:true});
  });
});

var server = app.listen(4040, function() {
  console.log('Listening on port %d', server.address().port);
});
