'use strict';

function _DebugHelper() {
}

_DebugHelper.prototype.init = function() {
  debugGui.add(this, 'printScene');
};

_DebugHelper.prototype.printScene = function() {
  function _printThis(obj) {
    var out = '';
    out += 'OBJ';
    out += '[' + obj.name + ']';
    out += ' @ ' + obj.position.x + ',' + obj.position.y + ',' + obj.position.z;

    console.groupCollapsed(out);
    for (var j = 0; j < obj.children.length; ++j) {
      _printThis(obj.children[j]);
    }
    console.groupEnd();
  }
  _printThis(scene);
};

var DebugHelper = new _DebugHelper();
