'use strict';

function enumToName(list, val) {
  for (var i in list) {
    if (list.hasOwnProperty(i)) {
      if (list[i] === val) {
        return i;
      }
    }
  }
  return 'unknown:' + val;
}

function hrTime() {
  return (new Date()).getTime();
}

var clientParams = [];
if (window.location.hash.length > 1) {
  clientParams = window.location.hash.substr(1).split(',');
}


function MultiWait() {
  this.count = 0;
  this.callback = null;

  var self = this;
  this.waitFn = function() {
    self.count--;
    if (self.count === 0 && self.callback) {
      self.callback();
    }
  };
}
MultiWait.prototype.one = function() {
  this.count++;
  return this.waitFn;
};
MultiWait.prototype.wait = function(callback) {
  if (this.count === 0) {
    if (callback) {
      callback();
    }
  } else {
    this.callback = callback;
  }
};
