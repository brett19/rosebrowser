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
  GDM.get('item_data', 'list_npc', callback);
};

GameState.prototype.update = function(delta) {
  GOM.update(delta);

  this.mcPawnRoot.position.copy(MC.position);
  this.mcPawnRoot.position.z += 1.6;
  this.worldMgr.setViewerInfo(MC.position);
  this.worldMgr.update(delta);
  this.gomVisMgr.update(delta);
};

GameState.prototype._startNpcTalk = function(npcObj) {
  if (npcObj.eventIdx === 0) {
    return;
  }

  GDM.get('list_event', 'quest_scripts', function(eventList) {
    var eventData = eventList.row(npcObj.eventIdx);

    if (!eventData) {
      console.log('Tried to start talking to an NPC with an invalid event.');
      return;
    }

    if (eventData[3]) {
      // TODO: Cache all this stuff
      NpcChatData.load(eventData[3], function(convSpec) {
        var conv = new Conversation(npcObj, convSpec, 'en');
        conv.start();
      });
    }
  });
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

  netGame.joinZone(MC.position.z, function(data) {
    // TODO: Read the actual serverObjectIdx
    MC.hp = data.curHp;
    MC.mp = data.curMp;
    MC.serverObjectIdx = data.objectIdx;
    MC.pawn = new CharPawn(MC);
    MC.debugValidate();
    MC.dropFromSky();
    GOM.addObject(MC);

    console.log('ZONE JOINED');
  });

  ui.gameUI(MC);

  var projector = new THREE.Projector();
  var self = this;
  InputManager.on('mousedown', function(e) {
    e.preventDefault();

    if ( e.button !== 0 ) {
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
        if (pickGo instanceof MobObject) {
          var atkCmd = MC.attackObj(pickGo);
          atkCmd.on('finish', function() {
            console.log('Finished Attacking!');
          });
        } else {
          var moveCmd = MC.moveToObj(pickGo);
          moveCmd.on('finish', function () {
            if (pickGo instanceof NpcObject) {
              self._startNpcTalk(pickGo);
            }
          });
        }
      }
    }

    if (worldPickInfo) {
      var moveToPos = worldPickInfo.point;
      MC.moveTo(moveToPos.x, moveToPos.y);
      self.pickPosH.position.copy(moveToPos);
    }
  });

  // TODO: @brett19 maybe move these somewhere else?
  netGame.on('quest_log', function(data) {
    MC.quests.setQuests(data.quests);
  });

  netGame.on('quest_vars', function(data) {
    MC.quests.setVars(data.vars);
  });

  netGame.on('questitem_list', function(data) {
    MC.quests.setItems(data.items);
  });

  netGame.on('quest_completion_data', function(data) {
    MC.quests.setDailyLog(data.dailyLog);
  });

  netGame.on('quest_reply', function(data) {
    switch(data.result) {
      case RESULT_QUEST_REPLY_ADD_SUCCESS:
      case RESULT_QUEST_REPLY_ADD_FAILED:
      case RESULT_QUEST_REPLY_DEL_SUCCESS:
      case RESULT_QUEST_REPLY_DEL_FAILED:
      case RESULT_QUEST_REPLY_TRIGGER_SUCCESS:
      case RESULT_QUEST_REPLY_TRIGGER_FAILED:
      case RESULT_QUEST_REPLY_UPDATE:
      case RESULT_QUEST_REPLY_COMPLETE:
      case RESULT_QUEST_REPLY_RESET:
      case RESULT_QUEST_REPLY_DAILY_RESET:
      default:
        console.warn('Unimplemented quest reply result ' + data.result);
    }
  });
};

GameState.prototype.leave = function() {
  scene.remove(this.worldMgr.rootObj);
};

StateManager.register('game', GameState);
var gsGame = StateManager.get('game');
