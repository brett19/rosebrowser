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

function Conversation(spec, lang) {
  EventEmitter.call(this);

  this._state = new ConversationState(spec, lang);
  this._luaState = eval(lua_load(spec.luaData))();
  QF_Init(this._luaState);

  this.message = '';
  this.options = {};
  this.dialog = null;
}
Conversation.prototype = Object.create(EventEmitter.prototype);

Conversation.prototype._ensureDialog = function() {
  if (!this.dialog) {
    this.dialog = ui.npcChatDialog(this);
  }
};

Conversation.prototype.close = function() {
  this.emit('closed');
};

Conversation.prototype.pickOption = function(optionId) {
  this._state.condValue = optionId;
  this._go();
};

Conversation.prototype._formatString = function(string) {
  var search = /<[A-Z_]*>/g;
  var match;

  while(match = search.exec(string)) {
    var prefix = string.substr(0, match.index);
    var suffix = string.substr(match.index + match[0].length);
    var content = match[0].substr(1, match[0].length - 2);

    // https://github.com/brett19/RoseOnlineEvo/blob/master/Game/Client/Event/CEvent.cpp#L553-L585
    if (content === 'NAME') {
      content = MC.name;
    } else if (content === 'LEVEL') {
      content = MC.level;
    } else {
      content = match[0];
    }

    string = prefix + content + suffix;
  }

  return string;
};

Conversation.prototype._go = function() {
  var running = true;
  while (running) {
    var reqval = this._state.exec();

    switch(reqval) {
    case CXECURREQ.CLOSE:
      this.emit('closed');
      running = false;
      break;
    case CXECURREQ.OPTCONDITION:
      this.message = this._formatString(this._state.message);
      this.options = this._state.options;
      for (var i = 0; i < this.options; ++i) {
        this.options[i] = this._formatString(this.options[i]);
      }
      this.emit('changed');
      this._ensureDialog();
      running = false;
      break;
    case CXECURREQ.LUACONDITION:
      var result = lua_tablegetcall(this._luaState, this._state.condParam);
      this._state.condValue = result[0];
      break;
    case CXECURREQ.LUAACTION:
      lua_tablegetcall(this._luaState, this._state.condParam);
      break;
    case CXECURREQ.QSDCONDITION:
      var result = QF_checkQuestCondition(this._state.condParam);
      this._state.condValue = result[0];
      break;
    case CXECURREQ.QSDACTION:
      QF_doQuestTrigger(this._state.condParam);
      break;
    default:
      console.warn('Received unknown request from ConversationState.');
      running = false;
    }
  }
};

GameState.prototype._startNpcTalk = function(npcObj) {
  GDM.get('list_event', 'quest_scripts', function(eventList) {
    var eventData = eventList.row(npcObj.eventIdx);
    if (!eventData) {
      console.log('Tried to start talking to an NPC with an invalid event.');
      return;
    }

    // TODO: Cache all this stuff
    NpcChatData.load(eventData[3], function(convSpec) {
      var conv = new Conversation(convSpec, 'en');
      conv._go();
    });

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

  netGame.joinZone(MC.position.z, function() {
    // TODO: Read the actual serverObjectIdx
    MC.hp = 1;
    MC.serverObjectIdx = 9999999;
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
