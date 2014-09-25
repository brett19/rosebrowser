'use strict';

function GameState() {
  State.call(this);

  this.worldMgr = new WorldManager();
  this.worldMgr.rootObj.position.set(5200, 5200, 0);
  this.gomVisMgr = new GOMVisManager(this.worldMgr);
  this.activeMapIdx = -1;
  this.mcPawnRoot = new THREE.Object3D();

  this.pickPosH = new THREE.AxisHelper(2);
}
GameState.prototype = new State();

GameState.prototype.setMap = function(mapIdx) {
  this.activeMapIdx = mapIdx;
};

GameState.prototype.prepare = function(callback) {
  var waitAll = new MultiWait();
  this.mapSwitchPrep(waitAll.one());
  GDM.get('item_data', waitAll.one());
  waitAll.wait(callback);
};

/**
 * This is used for initial login as well as map switch.
 * @param callback
 */
GameState.prototype.mapSwitchPrep = function(callback) {
  this.worldMgr.setMap(this.activeMapIdx, function() {
    callback();
  });
};

GameState.prototype.update = function(delta) {
  GOM.update(delta);

  this.mcPawnRoot.position.copy(MC.position);
  this.worldMgr.setViewerInfo(MC.position);
  this.worldMgr.update(delta);
  this.gomVisMgr.update(delta);
};

GameState.prototype.enter = function() {
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

  InventoryDialog.show();
  InventoryDialog.bindToData(MC.inventory);

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
        console.log(pickGo);
      }
    }

    if (worldPickInfo) {
      var moveToPos = worldPickInfo.point;
      netGame.moveTo(moveToPos.x, moveToPos.y, moveToPos.z);
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
