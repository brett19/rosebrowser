'use strict';

function _DebugHelper() {
}

_DebugHelper.prototype.init = function() {
  debugGui.add(this, 'logCameraLocation');
  debugGui.add(this, 'logScene');
};

_DebugHelper.prototype.logCameraLocation = function() {
  var worldPos = camera.localToWorld(new THREE.Vector3(0, 0, 0));
  console.log('Camera Location:', worldPos.x, worldPos.y, worldPos.z);
};

_DebugHelper.prototype.logScene = function() {
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
