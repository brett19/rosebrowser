'use strict';

var http = require('http');
var path = require('path');
var stream = require('stream');
var fs = require('fs');
var BufferedStream = require('bufferedstream');
var express = require('express');
var app = express();

// Helper to read a whole stream into a Buffer object.
function streamToBuffer(sourceStream, callback) {
  var bufs = [];
  sourceStream.on('data', function(d){ bufs.push(d); });
  sourceStream.on('end', function() {
    callback(null, Buffer.concat(bufs));
  });
}



var SOURCE_LOCATION = 'http://home.br19.com:82/rosedata/';

// Static Client Data
app.use(express.static(__dirname + '/client'));

// Data Stuffs
function Cacher(preProc) {
  this.path = __dirname + '/cache/';
  this.preProc = preProc;
}
Cacher.prototype.getSourceStream = function(filePath, callback) {
  if (this.preProc) {
    var preStream = this.preProc.call(this, filePath);
    if (preStream) {
      return callback(null, preStream);
    }
  }
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
      fs.mkdir(cacheDir, function() {
        var ws = fs.createWriteStream(cacheFile);
        self.getSourceStream(filePath, function(err, stream) {
          stream.pipe(ws, {end: true});
          callback(err, stream);
        });
      });
    }
  });
};



function zscToJson(buffer) {
  return {lol: 'we fucking win'};
}
function processFile(path) {
  function processByFunc(toJsonFun, path) {
    var fileStream = new BufferedStream();
    this.getSourceStream(path, function(err, sourceStream) {
      streamToBuffer(sourceStream, function(buffer) {
        fileStream.write(JSON.stringify(toJsonFun(buffer)));
        fileStream.end();
      });
    });
    return fileStream;
  }

  if (path.substr(path.length-9).toLowerCase() === '.zsc.json') {
    return processByFunc.call(this, zscToJson, path.substr(0, path.length-5));
  }
  return null;
}
var cache = new Cacher(processFile);

app.use('/data/*', function(req, res) {
  cache.getStream(req.baseUrl.substr(6), function(err, sourceStream) {
    sourceStream.pipe(res, {end:true});
  });
});

var server = app.listen(4040, function() {
  console.log('Listening on port %d', server.address().port);
});
