'use strict';

/**
 * A class used to provide various functionalities globally accross the
 * entire application, regardless of current state.
 *
 * @private
 */
function _DebugHelper() {
}

/**
 * Initializes the helper and registeres all the functions.
 */
_DebugHelper.prototype.init = function() {
  debugGui.add(this, 'logCamera');
  debugGui.add(this, 'logScene');
};

/**
 * Logs the current camera information to the console.
 */
_DebugHelper.prototype.logCamera = function() {
  var worldPos = camera.localToWorld(new THREE.Vector3(0, 0, 0));
  console.log('Camera Location:', worldPos.x, worldPos.y, worldPos.z);
};

/**
 * Logs a breakdown of the current scene to the console.
 */
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

/**
 * The global instance of the DebugHelper.
 *
 * @global
 * @type {_DebugHelper}
 */
var DebugHelper = new _DebugHelper();
