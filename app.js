'use strict';

var http = require('http');
var path = require('path');
var stream = require('stream');
var fs = require('fs');
var mkdirp = require('mkdirp')
var express = require('express');
var socketio = require('socket.io');
var yaml_config = require('node-yaml-config');

var config = yaml_config.load(__dirname + '/config.yml');

if (!config.data || !(config.data.local || config.data.remote)) {
  console.log('You need a proper config!');
  process.exit(0);
}

function Cacher(source) {
  this.source = source;
  this.path = __dirname + '/cache/';
}
Cacher.prototype.getSourceStream = function(filePath, callback) {
  http.request(this.source + filePath, function(lRes) {
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

if (config.data.local) {
  console.log('Serving data from local source:', config.data.local);
  app.use('/data', express.static(config.data.local));
} else {
  console.log('Serving data from remote source:', config.data.remote);
  var cache = new Cacher(config.data.remote);
  app.use('/data/*', function (req, res) {
    cache.getStream(req.baseUrl.substr(6), function (err, sourceStream) {
      sourceStream.pipe(res, {end: true});
    });
  });
}


var server = app.listen(4040, function() {
  console.log('Listening on port %d', server.address().port);
});

var io = socketio(server);
io.on('connection', function(socket){
  console.log('got socket');
  socket.on('ping', function(v){
    console.log('got message');
    socket.emit('pong');
  });
});
