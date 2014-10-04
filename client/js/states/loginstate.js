'use strict';

var rUser = null;
var rPass = null;

var USE_LIVE_SERVER = true;
var serverIp = '128.241.92.44';
var serverName = '!Pegasus';
if (USE_LIVE_SERVER) {
  serverIp = '128.241.92.36';
  serverName = '1Draconis';
}

/**
 * @constructor
 */
function LoginState() {
  State.call(this);
  
  this.DM = new DataManager();
}
LoginState.prototype = new State();

LoginState.prototype.prepareOnce = function(callback) {
  this.DM.register('canim_intro', AnimationData, 'CAMERAS/TITLEMAP_LOGIN.ZMO');
  this.DM.register('canim_inselect', AnimationData, 'CAMERAS/TITLEMAP_AVTLIST.ZMO');
  this.DM.register('canim_outselect', AnimationData, 'CAMERAS/TITLEMAP_AVTLIST_RETURN.ZMO');

  // Start loading this, going to need it later.
  GDM.get('zone_names', 'list_zone');

  var self = this;
  this.DM.get('canim_intro', function() {
    callback();

    // Continue by preloading the rest for now.
    self.DM.get('canim_inselect');
    self.DM.get('canim_outselect');
  });
};

LoginState.prototype.prepare = function(callback) {
  this.activeCamAnim = null;
  this.world = null;
  this.chars = [];
  this.selectedCharIdx = -1;
  this.visChars = [];

  callback();
};

LoginState.prototype._onSelectChar = function(charIdx) {
  for (var i = 0; i < this.visChars.length; ++i) {
    var visChar = this.visChars[i];
    if (i === charIdx) {
      visChar.rootObj.visible = true;
    } else {
      visChar.rootObj.visible = false;
    }
  }
  this.selectedCharIdx = charIdx;
};

LoginState.prototype._onConfirmChar = function() {
  var selectedChar = this.chars[this.selectedCharIdx];

  CharSelDialog.hide();

  var waitDialog = MsgBoxDialog.create('Confirming character...', false);

  var pickCharName = selectedChar.name;
  netWorld.selectCharacter(pickCharName, function(data) {
    waitDialog.setMessage('Character Selected. Connecting to Game Server.');

    // The pregame state has to be prepared before, if it is not
    //   able to switch synchronously, we risk loosing events
    //   related to the character data.
    StateManager.prepare('pregame', function() {
      netGame = new GameClient();
      netGame.connect(data.gameIp, data.gamePort, data.transferKey1, rPass, function () {
        waitDialog.close();
        StateManager.switch('pregame');
      });
    });
  });
};

LoginState.prototype.playNextAnim = function() {
  this.playCamAnim('canim_inselect', 1);
};

LoginState.prototype.playCamAnim = function(name, loopCount, speed, callback) {
  var self = this;
  console.log('Finding anim', name);
  this.DM.get(name, function(zmoData) {
    console.log('Playing anim', name);

    if (self.activeCamAnim) {
      self.activeCamAnim.stop();
      self.activeCamAnim = null;
    }

    self.activeCamAnim =
        new CameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    if (speed !== undefined) {
      self.activeCamAnim.timeScale = speed;
    }
    self.activeCamAnim.play(loopCount);

    if (callback) {
      self.activeCamAnim.on('complete', callback);
    }
  });
};

LoginState.prototype.enter = function() {
  var self = this;

  LoadScreen.hide();

  this.world = new MapManager();
  this.world.rootObj.position.set(5200, 5200, 0);
  this.world.setMap(7, function() {
    console.log('Map Ready');
    self.world.setViewerInfo(null);
  });

  scene.add(this.world.rootObj);

  this.playCamAnim('canim_intro');

  ui.loginDialog().on('done', function(username, password) {
    self._doneLogin(username, password);
  });
};

var activePass = null;

LoginState.prototype._doneLogin = function(rUser, rPass) {
  var self = this;
  activePass = rPass;

  console.log('Starting Login', rUser);

  var waitDialog = ui.statusDialog();
  waitDialog.setMessage('Connecting...');

  netLogin = new LoginClient();
  netLogin.connect(serverIp, 29000, function(err) {
    waitDialog.setMessage('Authenticating...');

    netLogin.login(rUser, rPass, function (data) {
      if ((data.result & 0x7f) !== NETLOGINREPLY.OK) {
        waitDialog.setMessage('Failed to Login (' + enumToName(NETLOGINREPLY, data.result) + ').');
        netLogin.end();
        return;
      }

      waitDialog.close();

      var srvSelReq = ui.serverSelectDialog(data.servers);
      srvSelReq.on('done', function(serverId) {
        self._doneSrvSel(serverId);
      });
    });
  });
};

LoginState.prototype._doneSrvSel = function(serverId) {
  var self = this;

  var waitDialog = ui.statusDialog();
  waitDialog.setMessage('Finding Server...');

  netLogin.channelList(serverId, function (data) {
    if (data.channels.length !== 1) {
      waitDialog.setMessage('More than one channel found!');
      netLogin.end();
      return;
    }

    waitDialog.setMessage('Found Server; Preparing to Connect...');

    var channelId = data.channels[0].id;
    netLogin.selectServer(serverId, channelId, function (data) {
      waitDialog.setMessage('Prepared; Connecting to Character Server...');
      netLogin.end();

      netWorld = new WorldClient();
      netWorld.connect(data.worldIp, data.worldPort, data.transferKey1, activePass, function () {
        waitDialog.setMessage('Connected to World Server;  Downloading characters...');

        netWorld.characterList(function (data) {

          // need list zone to show character select:
          GDM.get('zone_names', 'list_zone', function() {
            waitDialog.close();

            self._beginCharSelect(data);
          });
        });
      });
    });
  });
};

var CHARPOSITION = new THREE.Vector3(5742.0038, 5095.2579, 17.9782);
var CHARDIRECTION = 230;
var CHARSCALE = 3.5;

LoginState.prototype._beginCharSelect = function(charData) {
  var self = this;

  console.log('begin char select', charData);

  var listZones = GDM.getNow('list_zone');
  var zoneNames = GDM.getNow('zone_names');

  this.chars = charData.characters;
  for (var i = 0; i < charData.characters.length; ++i) {
    (function(charIdx, charInfo) {
      console.log('Char', charIdx, charInfo);

      var charObj = new CharPawn();
      charObj.setGender(0, function() {
        for (var j = 0; j < AVTBODYPART.Max; ++j) {
          charObj.setModelPart(j, charInfo.parts[j].itemNo);
        }
      });

      charObj.rootObj.position.copy(CHARPOSITION);
      charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), CHARDIRECTION/180*Math.PI);
      charObj.rootObj.scale.set(CHARSCALE, CHARSCALE, CHARSCALE);
      charObj.rootObj.visible = false;
      scene.add(charObj.rootObj);
      self.visChars.push(charObj);

      // Add Zone name on behalf of the CharSelDialog
      var zoneStrKey = listZones.item(charInfo.zoneNo, 26);
      charInfo.zoneName = zoneNames.getByKey(zoneStrKey).text;
    })(i, charData.characters[i]);
  }

  var self = this;
  console.log('INSELECT STARTED');
  this.playCamAnim('canim_inselect', 1, 8, function() {
    console.log('INSELECT DONE');

    var charSelReq = ui.characterSelectDialog(charData.characters);
    charSelReq.on('selectionChanged', function(characterIdx) {
      for (var i = 0; i < self.visChars.length; ++i) {
        var visChar = self.visChars[i];
        if (i === characterIdx) {
          visChar.rootObj.visible = true;
        } else {
          visChar.rootObj.visible = false;
        }
      }
    });
    charSelReq.on('done', function(characterName) {
      self._doneCharSel(characterName);
    });

    // Force a selection so the model becomes visible
    charSelReq.emit('selectionChanged', 0);
  });
};

LoginState.prototype._doneCharSel = function(characterName) {
  var waitDialog = ui.statusDialog();
  waitDialog.setMessage('Selecting Character...');

  netWorld.selectCharacter(characterName, function(data) {
    waitDialog.setMessage('Character Selected; Connecting to Game Server...');

    // The pregame state has to be prepared before, if it is not
    //   able to switch synchronously, we risk loosing events
    //   related to the character data.
    StateManager.prepare('pregame', function() {
      netGame = new GameClient();
      netGame.connect(data.gameIp, data.gamePort, data.transferKey1, activePass, function () {
        waitDialog.close();
        StateManager.switch('pregame');
      });
    });
  });
};

LoginState.prototype.leave = function() {
  for (var i = 0; i < this.visChars.length; ++i) {
    scene.remove(this.visChars[i].rootObj);
  }
  this.visChars = [];

  this.world.removeFromScene();
};

LoginState.prototype.update = function(delta) {
  this.world.update(delta);
  for (var i = 0; i < this.visChars.length; ++i) {
    this.visChars[i].update(delta);
  }
};

StateManager.register('login', LoginState);
