var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function ParticleTestState() {
  State.call(this);

  this.DM = new DataManager();
  this.world = null;
  this.objects = [];
}
ParticleTestState.prototype = new State();

ParticleTestState.prototype.prepare = function(callback) {
  GDM.get('npc_chars', function() {
    callback();
  });
};

ParticleTestState.prototype.spawnBonfire = function() {
  var bonfire = new NpcPawn();
  bonfire.setModel(801);
  bonfire.rootObj.position.set(5200, 5280, -5);
  bonfire.playIdleMotion();
  this.objects.push(bonfire);
  scene.add(bonfire.rootObj);
};

ParticleTestState.prototype.spawnRandom = function() {
  for (var i = 0; i < 100; ++i) {
    var charList = GDM.getNow('npc_chars');
    var charIdx;

    do {
      charIdx = Math.floor(Math.random() * 1000);
    } while(!charList.characters[charIdx]);

    var npc = new NpcPawn();
    npc.setModel(charIdx);
    npc.rootObj.position.set(5200 + (Math.random() * 90) - 45, 5280 + (Math.random() * 90) - 45, -5);
    npc.playIdleMotion();
    this.objects.push(npc);
    scene.add(npc.rootObj);
  }
};

ParticleTestState.prototype.fuckingMeteors = function() {
  var rootObj = new THREE.Object3D();
  rootObj.position.set(5200 + (Math.random() * 20) - 10, 5280 + (Math.random() * 20) - 10, -5);
  scene.add(rootObj);

  EffectManager.loadEffect('3Ddata\\EFFECT\\_RUNASTON_01.EFT', function(effect) {
    rootObj.add(effect.rootObj);
    rootObj.add(effect.rootObj2);
    effect.play();
    effect.on('finish', function() {
      console.log('EFFECT FINISHED!');
    });
  });
};

ParticleTestState.prototype.fuckingPointer = function() {
  var rootObj = new THREE.Object3D();
  rootObj.position.set(5200 + (Math.random() * 20) - 10, 5280 + (Math.random() * 20) - 10, -5);
  scene.add(rootObj);

  EffectManager.loadEffectByIdx(296, function(effect) {
    rootObj.add(effect.rootObj);
    rootObj.add(effect.rootObj2);
    effect.play();
    effect.on('finish', function() {
      console.log('EFFECT FINISHED!');
    });
  });
};

ParticleTestState.prototype.enter = function() {
  var self = this;

  debugGui.addButton('Spawn Random NPCs', this.spawnRandom.bind(this));
  debugGui.addButton('Spawn Bonfire', this.spawnBonfire.bind(this));
  debugGui.addButton('Test Meteors', this.fuckingMeteors.bind(this));
  debugGui.addButton('Test Pointer', this.fuckingPointer.bind(this));

  var container = document.createElement( 'div' );
  document.body.appendChild( container );

  var controls = new THREE.FreeFlyControls(camera);
  controls.movementSpeed = 100;
  controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5150;
  camera.position.y = 5333;
  camera.position.z = 39;

  if (1) {
    var wm = new MapManager();
    wm.rootObj.position.set(5200, 5200, 0);
    wm.setMap(5, function ()
    {
      console.log('Map Ready');
    });
    this.world = wm;
    scene.add(wm.rootObj);

    var charObj = new CharPawn();
    charObj.setGender(0, function ()
    {
      charObj.setModelPart(3, 1);
      charObj.setModelPart(4, 1);
      charObj.setModelPart(5, 1);
      charObj.setModelPart(7, 202);
      charObj.setModelPart(8, 2);

      var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
      AnimationData.load(animPath, function (zmoData)
      {
        var anim = new SkeletonAnimator(charObj.skel, zmoData);
        anim.play();
      });
    });
    charObj.rootObj.position.set(5205, 5285, -5);
    charObj.rootObj.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
    charObj.rootObj.scale.set(1.2, 1.2, 1.2);
    var effect = EffectManager.loadEffectByIdx(302, function() {
      effect.play();
      charObj.rootObj.add(effect.rootObj);
    });

    scene.add(charObj.rootObj);
  }
};

ParticleTestState.prototype.leave = function() {

};

ParticleTestState.prototype.update = function(delta) {
  this.controls.update( delta );

  if (this.world && this.world.isLoaded) {
    this.world.setViewerInfo(camera.position);
    this.world.update(delta);
  }

  for(var i = 0; i < this.objects.length; ++i) {
    this.objects[i].update(delta);
  }
};

StateManager.register('particle', ParticleTestState);
