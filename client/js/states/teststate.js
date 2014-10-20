var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function TestState() {
  State.call(this);

  this.DM = new DataManager();
  this.world = null;
}
TestState.prototype = new State();

TestState.prototype.prepare = function(callback) {
  this.DM.register('canim_intro', AnimationData, '3DDATA/TITLEIROSE/CAMERA01_INTRO01.ZMO');
  this.DM.register('canim_inselect', AnimationData, '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO');
  this.DM.register('canim_ingame', AnimationData, '3DDATA/TITLEIROSE/CAMERA01_INGAME01.ZMO');
  this.DM.register('canim_create', AnimationData, '3DDATA/TITLEIROSE/CAMERA01_CREATE01.ZMO');
  this.DM.register('canim_outcreate', AnimationData, '3DDATA/TITLEIROSE/CAMERA01_OUTCREATE01.ZMO');

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

  debugGui.addButton('Go In Select', this.goInSelect.bind(this));
  debugGui.addButton('Go In Game', this.goInGame.bind(this));

  var wm = new MapManager();
  wm.rootObj.position.set(5200, 5200, 0);
  wm.setMap(2, function() {
    console.log('Map Ready');
  });
  this.world = wm;
  scene.add(wm.rootObj);

  //this.playCamAnim('canim_intro');

  var container = document.createElement( 'div' );
  document.body.appendChild( container );

  var controls = new THREE.FlyControls(camera);
  controls.movementSpeed = 100;
  controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5200;
  camera.position.y = 5450;
  camera.position.z = 140;

  /*
  var charObj = new NpcCharacter();
  charObj.setModel(1);
  */
  var charObj = new CharPawn();
  charObj.setGender(0, function() {
    charObj.setModelPart(3, 1);
    charObj.setModelPart(4, 1);
    charObj.setModelPart(5, 1);
    charObj.setModelPart(7, 202);
    charObj.setModelPart(8, 2);

    var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
    AnimationData.load(animPath, function(zmoData) {
      var anim = new SkeletonAnimator(charObj.skel, zmoData);
      anim.play();
    });
  });
  charObj.rootObj.position.set(5205, 5205, 1);
  charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI);
  charObj.rootObj.scale.set(1.2, 1.2, 1.2);
  scene.add(charObj.rootObj);

  Mesh.load('3DDATA/JUNON/SKY/DAY01.ZMS', function(geom) {
    var texd = TextureManager.load('3DDATA/JUNON/SKY/DAY01.DDS');
    var texn = TextureManager.load('3DDATA/JUNON/SKY/NIGHT01.DDS');
    var mat = ShaderManager.get('skydome').clone();
    mat.uniforms = {
      texture1: { type: 't', value: texd },
      texture2: { type: 't', value: texn },
      blendRatio: { type: 'f', value: 0.5 }
    };
    skyObject = new THREE.Mesh(geom, mat);
    scene.add(skyObject);
  });

  var invPak = {"result":1,"money":{"lo":200,"hi":0},"items":[{"itemType":2,"itemNo":222,"charDbId":3435973836,"color":1,"itemKey":{"lo":9532290,"hi":0},"isCrafted":0,"gemOption1":0,"gemOption2":0,"gemOption3":0,"durability":32,"itemLife":1000,"socketCount":0,"isAppraised":0,"refineGrade":0,"quantity":1,"location":1,"slotNo":0,"timeRemaining":0,"moveLimits":0,"bindOnAcquire":0,"bindOnEquipUse":0,"money":0},{"itemType":8,"itemNo":1,"charDbId":3435973836,"color":1,"itemKey":{"lo":9532291,"hi":0},"isCrafted":0,"gemOption1":0,"gemOption2":0,"gemOption3":0,"durability":19,"itemLife":997,"socketCount":0,"isAppraised":0,"refineGrade":0,"quantity":1,"location":2,"slotNo":7,"timeRemaining":0,"moveLimits":0,"bindOnAcquire":0,"bindOnEquipUse":0,"money":0},{"itemType":5,"itemNo":29,"charDbId":3435973836,"color":1,"itemKey":{"lo":9532292,"hi":0},"isCrafted":0,"gemOption1":0,"gemOption2":0,"gemOption3":0,"durability":7,"itemLife":998,"socketCount":0,"isAppraised":0,"refineGrade":0,"quantity":1,"location":2,"slotNo":6,"timeRemaining":0,"moveLimits":0,"bindOnAcquire":0,"bindOnEquipUse":0,"money":0},{"itemType":3,"itemNo":29,"charDbId":3435973836,"color":1,"itemKey":{"lo":9532293,"hi":0},"isCrafted":0,"gemOption1":0,"gemOption2":0,"gemOption3":0,"durability":12,"itemLife":999,"socketCount":0,"isAppraised":0,"refineGrade":0,"quantity":1,"location":2,"slotNo":3,"timeRemaining":0,"moveLimits":0,"bindOnAcquire":0,"bindOnEquipUse":0,"money":0}]};
  function checkForInt64(val) {
    if (val instanceof Object) {
      for (var i in val) {
        if (Array.isArray(val[i])) {
          for (var j = 0; j < val[i].length; ++j) {
            checkForInt64(val[i][j]);
          }
        } else if (val[i] instanceof Object) {
          if (val[i].lo !== undefined && val[i].hi !== undefined) {
            val[i] = new Int64(val[i].lo, val[i].hi);
          } else {
            checkForInt64(val[i]);
          }
        }
      }
    }
  }
  checkForInt64(invPak);

  var dt = new Date();
  GDM.get('item_data', function() {
    console.log((new Date()).getTime() - dt.getTime());
    var invData = InventoryData.fromPacketData(invPak);
    InventoryDialog.bindToData(invData);
    InventoryDialog.show();
  });
};

TestState.prototype.leave = function() {

};

TestState.prototype.update = function(delta) {
  this.controls.update( delta );

  if (this.world && this.world.isLoaded) {
    this.world.setViewerInfo(camera.position);
    this.world.update(delta);
  }
};

StateManager.register('test', TestState);
