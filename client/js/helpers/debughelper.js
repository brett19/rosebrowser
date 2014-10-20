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
  debugGui.addButton('Debug Camera', this.toggleDebugCamera.bind(this));
  debugGui.addButton('Log Camera', this.logCamera.bind(this));
  debugGui.addButton('Log Scene', this.logScene.bind(this));
  debugGui.addButton('Bounding Boxes', this.toggleBoundingBoxes.bind(this));
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

_DebugHelper.prototype.toggleDebugCamera = function() {
  if (!debugCamera) {
    debugCamera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    debugCamera.position.setFromMatrixPosition(camera.matrixWorld);
    debugCamera.quaternion.setFromRotationMatrix(camera.matrixWorld);
    debugControls = new THREE.FreeFlyControls(debugCamera, debugInput);
    debugControls.movementSpeed = 100;
    debugCamFrust.camera = camera;
    scene.add(debugCamFrust);
  } else {
    debugCamera = null;
    debugControls = null;
    scene.remove(debugCamFrust);
  }
};

_DebugHelper.prototype.toggleBoundingBoxes = function() {
  debugBoundingBoxes = !debugBoundingBoxes;

  for (var i = 0; i < GZM.colObjects.length; ++i) {
    GZM.colObjects[i].visible = debugBoundingBoxes;
  }
};

/**
 * The global instance of the DebugHelper.
 *
 * @global
 * @type {_DebugHelper}
 */
var DebugHelper = new _DebugHelper();
module.exports = DebugHelper;
