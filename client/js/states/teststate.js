'use strict';

function TestState() {
  this.DM = new DataManager();
}

TestState.prototype.prepare = function(callback) {
  this.DM.register('canim_intro', Animation, '3DDATA/TITLEIROSE/CAMERA01_INTRO01.ZMO');
  this.DM.register('canim_inselect', Animation, '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO');
  this.DM.register('canim_ingame', Animation, '3DDATA/TITLEIROSE/CAMERA01_INGAME01.ZMO');
  this.DM.register('canim_create', Animation, '3DDATA/TITLEIROSE/CAMERA01_CREATE01.ZMO');
  this.DM.register('canim_outcreate', Animation, '3DDATA/TITLEIROSE/CAMERA01_OUTCREATE01.ZMO');

  var self = this;
  this.DM.get('canim_intro', function() {
    callback();

    // Continue by preloading the rest for now.
    self.DM.get('canim_inselect');
    self.DM.get('canim_ingame');
    self.DM.get('canim_create');
    self.DM.get('canim_outcreate');

  });

  this.activeCamAnim = null;
};

TestState.prototype.playCamAnim = function(name, loopCount) {
  var self = this;
  this.DM.get(name, function(zmoData) {
    if (self.activeCamAnim) {
      self.activeCamAnim.stop();
      self.activeCamAnim = null;
    }

    self.activeCamAnim =
        new CameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    self.activeCamAnim.play(loopCount);
  });
};

TestState.prototype.goInSelect = function() {
  this.playCamAnim('canim_inselect', 1);
};
TestState.prototype.goInGame = function() {
  this.playCamAnim('canim_ingame', 1);
};

TestState.prototype.enter = function() {
  var self = this;

  debugGui.add(this, 'goInSelect');
  debugGui.add(this, 'goInGame');

  var wm = new WorldManager();
  wm.rootObj.position.set(5200, 5200, 0);
  wm.setMap(2, function() {
    console.log('Map Ready');
  });
  scene.add(wm.rootObj);

  //this.playCamAnim('canim_intro');

  var container = document.createElement( 'div' );
  document.body.appendChild( container );

  var controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 100;
  controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5100;
  camera.position.y = 5450;
  camera.position.z = 140;

  /*
  var charObj = new NpcCharacter();
  charObj.setModel(1);
  */
  var charObj = new Avatar();
  charObj.setGender(0, function() {
    charObj.setModelPart(3, 1);
    charObj.setModelPart(4, 1);
    charObj.setModelPart(5, 1);
    charObj.setModelPart(7, 202);
    charObj.setModelPart(8, 2);

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
  this.controls.update( delta );
};

var gsTest = new TestState();
