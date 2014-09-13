'use strict';

function TestState() {

}

TestState.prototype.prepare = function(callback) {
  callback();
};

TestState.prototype.test = function() {
  console.log('TEST!');
};

TestState.prototype.enter = function() {
  var self = this;

  debugGui.add(this, 'test');

  var wm = new WorldManager();
  wm.rootObj.position.set(5200, 5200, 0);
  wm.setMap(0, function() {
    console.log('Map Ready');
  });
  scene.add(wm.rootObj);

  var animPath = '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO';
  Animation.load(animPath, function(zmoData) {
    var camAnim = new CameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    camAnim.play(1);
  });

  /*
  var charObj = new NpcCharacter();
  charObj.setModel(1);
  */
  var charObj = new Avatar();
  charObj.setGender(0, function() {
    charObj.setModelPart(0, 1);
    charObj.setModelPart(1, 2);
    charObj.setModelPart(2, 1);
    charObj.setModelPart(3, 1);
    charObj.setModelPart(4, 1);

    var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
    Animation.load(animPath, function(zmoData) {
      var anim = zmoData.createForSkeleton('test', charObj.rootObj, charObj.skel);
      anim.play();
    });
  });
  charObj.rootObj.position.set(5205, 5205, 1);
  charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI);
  charObj.rootObj.scale.set(1.2, 1.2, 1.2);
  scene.add(charObj.rootObj);
};

TestState.prototype.leave = function() {

};

TestState.prototype.update = function(delta) {
};
