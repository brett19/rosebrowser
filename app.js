'use strict';

var http = require('http');
var express = require('express');
var app = express();

// Static Client Data
app.use(express.static(__dirname + '/client'));

// Data Stuffs
var SOURCE_LOCATION = 'http://home.br19.com:82/rosedata/';
app.use('/data/*', function(req, res) {
  var lReq = http.request(SOURCE_LOCATION + req.baseUrl.substr(6), function(lRes) {
    lRes.pipe(res, {end: true});
  });
  req.pipe(lReq, {end: true})
});

var server = app.listen(4040, function() {
  console.log('Listening on port %d', server.address().port);
});
