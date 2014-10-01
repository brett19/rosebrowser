'use strict';

var http = require('http');
var path = require('path');
var net = require('net');
var stream = require('stream');
var fs = require('fs');
var mkdirp = require('mkdirp')
var express = require('express');
var socketio = require('socket.io');
var less = require('less');
var yaml_config = require('node-yaml-config');

var config = yaml_config.load(path.normalize(__dirname + '/config.yml'));
if (!config.client) {
  config.client = {};
}

if (!config.data || !(config.data.local || config.data.remote)) {
  console.log('You need a proper config!');
  process.exit(0);
}



http.globalAgent.maxSockets = 100;


// Helper to read a whole stream into a Buffer object.
function streamToBuffer(sourceStream, callback) {
  var bufs = [];
  sourceStream.on('data', function(d){ bufs.push(d); });
  sourceStream.on('end', function() {
    callback(null, Buffer.concat(bufs));
  });
}



function Cacher(source) {
  this.source = source;
  this.path = path.normalize(__dirname + '/cache/');
}
Cacher.prototype.getSourceStream = function(filePath, callback) {
  http.request(this.source + filePath, function(lRes) {
    callback(null, lRes);
  }).end();
};
Cacher.prototype.getStream = function(filePath, callback) {
  filePath = path.normalize(filePath);

  var cacheFile = this.path + filePath;
  var cacheDir = path.dirname(cacheFile);

  var self = this;
  fs.exists(cacheFile, function(fileExists) {
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

app.get('/config', function(req, resp, next) {
  resp.send('var config = ' + JSON.stringify(config.client) + ';');
});

// Less automatic compilation
app.get('*.less', function(req, res, next) {
  fs.readFile('client' + req.path, {encoding: 'utf8'}, function(err, data) {
    if (err) {
      return res.send(err);
    }
    less.render(data, function(err, css) {
      if (err) {
        return res.send(err);
      }
      res.send(css);
    });
  });
});

// Static Client Data
app.use(express.static(path.normalize(__dirname + '/client')));

if (config.data.local) {
  console.log('Serving data from local source:', config.data.local);
  app.use('/data', express.static(path.normalize(config.data.local)));
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
io.on('connection', function(socket) {
  var sockets = [];
  socket.on('disconnect', function() {
    console.log('td');
    for (var i = 0; i < sockets.length; ++i) {
      if (sockets[i]) {
        sockets[i].end();
      }
    }
  });
  socket.on('fr', function(reqIdx, path) {
    cache.getStream(path, function (err, sourceStream) {
      streamToBuffer(sourceStream, function(err, sourceBuf) {
        socket.emit('fr', reqIdx, sourceBuf);
      });
    });
  });
  socket.on('tc', function(sockIdx, host, port) {
    console.log('tc', sockIdx, host, port);

    var outSock = net.connect(port, host);
    sockets[sockIdx] = outSock;

    outSock.on('connect', function() {
      console.log('Got connection for', sockIdx);
      socket.emit('tc', sockIdx);
    });
    outSock.on('error', function(e) {
      console.log('Got error from', sockIdx);
      socket.emit('te', sockIdx, e);
    });
    outSock.on('end', function() {
      console.log('Got end from', sockIdx);
      socket.emit('tx', sockIdx);
      sockets[sockIdx] = null;
    });
    outSock.on('data', function(data) {
      console.log('Got data from', sockIdx, data);
      socket.emit('tp', sockIdx, data);
    });
  });
  socket.on('tx', function(sockIdx) {
    var outSock = sockets[sockIdx];
    if (outSock) {
      outSock.end();
    }
  });
  socket.on('tp', function(sockIdx, data) {
    var outSock = sockets[sockIdx];
    if (!Buffer.isBuffer(data)) {
      throw new Error('data was not a buffer!');
    }
    console.log('Sending to', sockIdx, data);
    if (outSock) {
      outSock.write(data);
      console.log('written...');
    }
  });
});
