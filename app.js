'use strict';

var http = require('http');
var path = require('path');
var net = require('net');
var stream = require('stream');
var fs = require('fs');
var mkdirp = require('mkdirp')
var express = require('express');
var socketio = require('socket.io');
var yaml_config = require('node-yaml-config');
var SshTunnel = require('./sshtunnel');

var config = yaml_config.load(__dirname + '/config.yml');
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
  this.path = __dirname + '/cache/';
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

    function doRealConnect(tHost, tPort) {
      var outSock = net.connect(tPort, tHost);
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

      return outSock;
    }

    if (!config.sshtunnel) {
      doRealConnect(host, port);
    } else {
      var myRandomPort = 10000 + Math.floor(Math.random() * 5000);
      var tunnelConfig = {
        remoteHost: host,
        remotePort: port,
        localPort: myRandomPort,
        sshConfig: config.sshtunnel
      };
      console.log('Opening SSH Tunnel', host, port, myRandomPort);
      var tunnel = new SshTunnel(tunnelConfig);
      tunnel.connect(function () {
        console.log('New SSH Tunnel Active');
        var sock = doRealConnect('localhost', myRandomPort);
        sock.on('end', function() {
          tunnel.close();
        });
      });
    }
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
