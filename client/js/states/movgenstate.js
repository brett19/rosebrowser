var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function MovGenState() {
  State.call(this);

  this.world = null;
}
MovGenState.prototype = new State();

MovGenState.prototype.prepare = function(callback) {
  callback();
};

MovGenState.prototype.genMovData = function() {
  var bounds = [5600, 4960, 5760, 5280];

  console.log('Generating move data.');

  this.world.rootObj.updateMatrixWorld();

  var self = this;
  function sampleOne(x, y, u, v) {
    var highZ = self.world.findHighPoint(x+u, y+v);
    return highZ;
  }

  for (var ix = bounds[0] / 10; ix < bounds[2] / 10; ++ix) {
    for (var iy = bounds[1] / 10; iy < bounds[3] / 10; ++iy) {
      var bX = ix * 10 + 5;
      var bY = iy * 10 + 5;

      var samples = [];

      for (var jx = -5; jx <= 5; jx += 2) {
        for (var jy = -5; jy <= 5; jy += 2) {
          samples.push(sampleOne(bX, bY, jx, jy));
        }
      }

      /*
      samples.push(sampleOne(bX, bY, -2.5, -2.5));
      samples.push(sampleOne(bX, bY, 2.5, -2.5));
      samples.push(sampleOne(bX, bY, -2.5, 2.5));
      samples.push(sampleOne(bX, bY, 2.5, 2.5));
      */

      var avgHeight = 0;
      for (var i = 0; i < samples.length; ++i) {
        avgHeight += samples[i];
      }
      avgHeight /= samples.length;

      var canMove = true;
      for (var i = 0; i < samples.length; ++i) {
        if (Math.abs(avgHeight - samples[i]) > 5) {
          canMove = false;
        }
      }

      if (canMove) {
        var ah = new THREE.AxisHelper(1);
        ah.position.set(bX, bY, avgHeight+2);
        scene.add(ah);
      }
    }
  }

  console.log('Generated move data.');
};

MovGenState.prototype.enter = function() {
  var self = this;

  var wm = new MapManager();
  wm.rootObj.position.set(5200, 5200, 0);
  wm.setMap(7, function() {
    console.log('Map Ready');
    wm.setViewerInfo(null, function() {
      self.genMovData();
    });
  });

  this.world = wm;
  scene.add(wm.rootObj);

  var controls = new THREE.FreeFlyControls(camera);
  controls.movementSpeed = 100;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5552;
  camera.position.y = 5159;
  camera.position.z = 180;
};

MovGenState.prototype.leave = function() {

};

MovGenState.prototype.update = function(delta) {
  this.controls.update( delta );
};

StateManager.register('movgen', MovGenState);
