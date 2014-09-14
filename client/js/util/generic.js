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

var clientParams = [];
if (window.location.hash.length > 1) {
  clientParams = window.location.hash.substr(1).split(',');
}
