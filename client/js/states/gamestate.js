'use strict';

/**
 * @constructor
 */
function GameState() {
  State.call(this);

  this.worldMgr = null;
  this.gomVisMgr = null;
  this.activeMapIdx = -1;
  this.mcPawnRoot = new THREE.Object3D();

  this.pickPosH = new THREE.AxisHelper(2);
}
GameState.prototype = new State();

GameState.prototype.prepare = function(callback) {
  GDM.get('item_data', callback);
};

GameState.prototype.update = function(delta) {
  GOM.update(delta);

  this.mcPawnRoot.position.copy(MC.position);
  this.worldMgr.setViewerInfo(MC.position);
  this.worldMgr.update(delta);
  this.gomVisMgr.update(delta);
};

GameState.prototype.enter = function() {
  this.worldMgr = gameWorld;
  this.gomVisMgr = new GOMVisManager(gameWorld);

  this.worldMgr.addToScene();
  this.gomVisMgr.addToScene();

  var mcPawn = this.gomVisMgr.findByObject(MC);

  // Some of this will need to be moved to a place thats used when you
  //  switch maps as well...
  camera.lookAt(0, 0, 0);
  camera.position.set(4, 4, 4);
  this.mcPawnRoot.add(camera);
  scene.add(this.mcPawnRoot);

  this.pickPosH.position.copy(MC.position);
  scene.add(this.pickPosH);

  var controls = new THREE.OrbitControls(camera);
  controls.damping = 0.2;

  netGame.joinZone(MC.position.z, function() {
    console.log('ZONE JOINED');
  });

  GUI.showGameUi(MC);

  var projector = new THREE.Projector();
  var self = this;
  InputManager.on('mousedown', function(e) {
    e.preventDefault();

    if ( event.button !== 0 ) {
      return;
    }

    var mouse = new THREE.Vector3(0, 0, 0.5);
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    projector.unprojectVector( mouse, camera );

    var cameraPos = camera.localToWorld(new THREE.Vector3(0,0,0));
    var ray = new THREE.Raycaster(cameraPos, mouse.sub( cameraPos ).normalize());

    var objPickInfo = self.gomVisMgr.rayPick(ray);
    var worldPickInfo = self.worldMgr.rayPick(ray);
    if (worldPickInfo && objPickInfo) {
      if (worldPickInfo.distance < objPickInfo.distance) {
        // If the world is closer, remove the object pick
        objPickInfo = null;
      } else {
        // Otherwise, remove the world pick
        worldPickInfo = null;
      }
    }

    if (objPickInfo) {
      var pickPawn = self.gomVisMgr.findByMesh(objPickInfo.object);
      if (pickPawn) {
        var pickGo = pickPawn.owner;
        MC.moveToObj(pickGo);
      }
    }

    if (worldPickInfo) {
      var moveToPos = worldPickInfo.point;
      MC.moveTo(moveToPos.x, moveToPos.y);
      self.pickPosH.position.copy(moveToPos);
    }
  });
};

GameState.prototype.leave = function() {
  scene.remove(this.worldMgr.rootObj);
};

StateManager.register('game', GameState);
var gsGame = StateManager.get('game');
