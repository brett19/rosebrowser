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

// Build a list of parameters passed
var clientParams = [];
if (window.location.hash.length > 1) {
  clientParams = window.location.hash.substr(1).split(',');
}

// Generate option changes based on this.
for (var i = 0; i < clientParams.length; ++i) {
  var param = clientParams[i];
  var paramEqIdx = param.indexOf('=');
  if (paramEqIdx === -1) {
    config[param] = true;
  } else {
    var paramName = param.substr(0, paramEqIdx);
    var paramVal = param.substr(paramEqIdx+1);
    config[paramName] = paramVal;
  }
}


function debugValidateProps(obj, props) {
  for (var i = 0; i < props.length; ++i) {
    var propVal = eval('obj.' + props[i][0]);
    if (propVal === undefined) {
      console.warn('Expected property to be set: ', props[i][0]);
      console.trace();
      continue;
    }
    if (propVal instanceof Int64) {
      // We can cheat since the check value has to be 32bit anyways.
      if (propVal.hi !== 0 ||
        props[i][1] && propVal.lo < props[i][1] ||
        props[i][2] && propVal.lo > props[i][2]) {
        console.warn('Expected property', props[i][0], 'to be between', props[i][1], 'and', props[i][2], '(got:0x' + propVal.toString(16) + ')');
        console.trace();
        continue;
      }
    } else {
      if (props[i][1] && propVal < props[i][1] ||
          props[i][2] && propVal > props[i][2]) {
        console.warn('Expected property', props[i][0], 'to be between', props[i][1], 'and', props[i][2], '(got:' + propVal + ')');
        console.trace();
        continue;
      }
    }
  }
}


function normalizePath(path) {
  path = path.replace(/\\/g, '/');
  path = path.replace(/\/\//g, '/');
  return path;
}


// http://javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(x, n) {
  return ((x % n) + n) %n;
}


function slerp1d(a, b) {
  var targetDir = mod(a, Math.PI * 2);
  var thisDir = mod(b, Math.PI * 2);
  var deltaDir = targetDir - thisDir;
  var absDeltaDir = Math.abs(deltaDir);
  var signDeltaDir = absDeltaDir === deltaDir ? +1 : -1;
  if (absDeltaDir > Math.PI) {
    deltaDir = signDeltaDir * (2 * Math.PI - absDeltaDir) * -1;
  }
  return deltaDir;
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
