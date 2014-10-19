var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function GameState() {
  State.call(this);

  this.mcPawnRoot = new THREE.Object3D();

  this.pickPos = null;
  this.targetGo = null;
}
GameState.prototype = new State();

GameState.prototype._setTarget = function(go) {
  if (this.targetGo) {
    MC.target = null;
    this.targetGo.selected = false;
    this.targetGo.emit('deselected');
    this.targetGo = null;
  }

  MC.target = go.ref;
  this.targetGo = go;
  go.selected = true;
  go.emit('selected');
};

GameState.prototype._setPickPos = function(pos) {
  if (this.pickPos) {
    scene.remove(this.pickPos);
    this.pickPos = null;
  }

  var newPickPos = new THREE.Object3D();
  this.pickPos = newPickPos;
  EffectManager.loadEffectByIdx(296, function(effect) {
    if (this.pickPos !== newPickPos) {
      return;
    }

    if (effect) {
      newPickPos.add(effect.rootObj);
      newPickPos.add(effect.rootObj2);

      effect.on('finish', function () {
        newPickPos.remove(effect.rootObj);
        newPickPos.remove(effect.rootObj2);
      });

      effect.play();
    }

    newPickPos.position.copy(pos);
    scene.add(newPickPos);
  }.bind(this));
};

GameState.prototype.prepare = function(callback) {
  GDM.get(
      'item_data',
      'skill_data',
      'list_npc',
      'list_class',
      'char_motiontypes',
      callback);
};

GameState.prototype.update = function(delta) {
  GZM.update(delta);

  this.mcPawnRoot.position.copy(MC.position);
  this.mcPawnRoot.position.z += 1.6;
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

var _MOUSEPROJECTOR = new THREE.Projector();
GameState.prototype._getMouseRay = function(mouseX, mouseY) {
  var mouse = new THREE.Vector3(0, 0, 0.5);
  mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( mouseY / window.innerHeight ) * 2 + 1;
  _MOUSEPROJECTOR.unprojectVector( mouse, camera );
  var cameraPos = camera.localToWorld(new THREE.Vector3(0,0,0));
  var ray = new THREE.Raycaster(cameraPos, mouse.sub( cameraPos ).normalize());
  return ray;
};

GameState.prototype.enter = function() {
  GZM.addToScene();

  // Some of this will need to be moved to a place thats used when you
  //  switch maps as well...
  camera.lookAt(0, 0, 0);
  camera.position.set(4, 4, 4);
  this.mcPawnRoot.add(camera);
  scene.add(this.mcPawnRoot);

  var controls = new THREE.OrbitControls(camera);
  controls.damping = 0.2;

  netGame.joinZone(MC.position.z, function(data) {
    MC.hp = data.curHp;
    MC.mp = data.curMp;
    MC.serverObjectIdx = data.objectIdx;
    MC.pawn = new CharPawn(MC);
    MC.ingStatus.setRootObj(MC.pawn.rootObj);
    MC.debugValidate();
    GZM.addObject(MC);
    GZM.setCenterObject(MC);

    console.log('ZONE JOINED');
  });

  ui.gameUI(MC);

  var self = this;
  InputManager.on('mousemove', function(e) {
    var ray = self._getMouseRay(e.clientX, e.clientY);
    var pickInfo = GZM.objectRayPick(ray);
    if (pickInfo) {
      $('body').css('cursor', 'pointer');
    } else {
      $('body').css('cursor', 'default');
    }
  });
  InputManager.on('mousedown', function(e) {
    e.preventDefault();

    if ( e.button !== 0 ) {
      return;
    }

    var ray = self._getMouseRay(e.clientX, e.clientY);
    var pickInfo = GZM.rayPick(ray);
    if (pickInfo) {
      if (pickInfo.object) {
        var pickGo = pickInfo.object;
        self._setTarget(pickGo);
        if (pickGo instanceof MyCharacter) {
          // Don't move to yourself or anything...
        } else if (pickGo instanceof CharObject) {
          GC.moveToObj(pickGo);
        } else if (pickGo instanceof NpcObject) {
          var moveCmd = GC.moveToObj(pickGo);
          moveCmd.on('finish', function () {
            console.log('Finished walk-to-object!');
            self._startNpcTalk(pickGo);
          });
        } else if (pickGo instanceof MobObject) {
          var atkCmd = GC.attackObj(pickGo);
          atkCmd.on('finish', function() {
            console.log('Finished Attacking!');
          });
        } else if (pickGo instanceof ItemObject) {
          var moveCmd = GC.moveToObj(pickGo);
          moveCmd.on('finish', function() {
            console.log('Finished walk-to-object!');
            netGame.pickupItem(pickGo.serverObjectIdx);
          });
        }
      } else if (pickInfo.point) {
        var moveToPos = pickInfo.point;
        GC.moveTo(moveToPos.x, moveToPos.y);
        self._setPickPos(moveToPos);
      }
    }
  });
};

GameState.prototype.leave = function() {
  GZM.removeFromScene();
};

StateManager.register('game', GameState);
