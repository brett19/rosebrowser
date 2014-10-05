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
        waitDialog.setMessage('Connected to World Server');
        self._startCharSelect(waitDialog);
      });
    });
  });
};

LoginState.prototype._startCharSelect = function(waitDialog) {
  var self = this;

  if (waitDialog === undefined) {
    waitDialog = ui.statusDialog();
  }

  waitDialog.setMessage('Downloading characters...');

  netWorld.characterList(function (data) {
    GDM.get('zone_names', 'list_zone', function() {
      waitDialog.close();
      self._beginCharSelect(data);
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

  // Remove any previous characters!
  for (var i = 0; i < this.visChars.length; ++i) {
    scene.remove(this.visChars[i].rootObj);
  }

  this.visChars = [];
  this.chars = charData.characters;

  for (var i = 0; i < charData.characters.length; ++i) {
    (function(charIdx, charInfo) {
      console.log('Char', charIdx, charInfo);

      var charObj = new CharPawn();
      charObj.setGender(charInfo.gender, function() {
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

    var dialog = ui.characterSelectDialog(charData.characters);
    dialog.on('selectionChanged', function(characterIdx) {
      for (var i = 0; i < self.visChars.length; ++i) {
        var visChar = self.visChars[i];
        if (i === characterIdx) {
          visChar.rootObj.visible = true;
        } else {
          visChar.rootObj.visible = false;
        }
      }
    });

    dialog.on('done', self._doneCharSel.bind(self));

    dialog.on('create', function() {
      dialog.hide();
      self._beginCharacterCreate(dialog);
    });

    // Force a selection so the model becomes visible
    dialog.emit('selectionChanged', 0);
  });
};

LoginState.prototype._beginCharacterCreate = function (charSelectDialog) {
  var self = this;
  var visibleCharacter = null;

  // Hide all select characters
  for (var i = 0; i < this.visChars.length; ++i) {
    if (this.visChars[i].rootObj.visible) {
      visibleCharacter = this.visChars[i].rootObj;
    }
    this.visChars[i].rootObj.visible = false;
  }

  // Create our dummy character
  var charObj = new CharPawn();
  charObj.setGender(0, function() {
    for (var j = 0; j < AVTBODYPART.Max; ++j) {
      if (j === AVTBODYPART.Face || j === AVTBODYPART.Hair) {
        charObj.setModelPart(j, 1);
      } else {
        charObj.setModelPart(j, 0);
      }
    }
  });

  charObj.rootObj.position.copy(CHARPOSITION);
  charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), CHARDIRECTION/180*Math.PI);
  charObj.rootObj.scale.set(CHARSCALE, CHARSCALE, CHARSCALE);
  charObj.rootObj.visible = true;
  scene.add(charObj.rootObj);

  // Create our dialog
  var dialog = ui.characterCreateDialog();
  dialog.on('change_gender', function(gender) {
    charObj.setGender(gender);
  });

  dialog.on('change_face', function(face) {
    charObj.setModelPart(AVTBODYPART.Face, face);
  });

  dialog.on('change_hair_style', function(style) {
    charObj.setModelPart(AVTBODYPART.Hair, style);
  });

  dialog.on('change_hair_color', function(color) {
  });

  dialog.on('create', function(name, gender, face, hairStyle, hairColor) {
    netWorld.createCharacter(name, gender, face, hairStyle, hairColor, function(data) {
      switch (data.result) {
      case RESULT_CREATE_CHAR_OK:
        dialog.close();
        charSelectDialog.close();
        scene.remove(charObj.rootObj);
        self._startCharSelect();
        break;
      case RESULT_CREATE_CHAR_FAILED:
        ui.messageBox('Create character failed for unknown reason.');
        break;
      case RESULT_CREATE_CHAR_DUP_NAME:
        ui.messageBox('Character name is already taken.');
        break;
      case RESULT_CREATE_CHAR_INVALID_NAME:
        ui.messageBox('Character name is invalid.');
        break;
      case RESULT_CREATE_CHAR_NO_MORE_SLOT:
        ui.messageBox('No more free character slots available.');
        break;
      case RESULT_CREATE_CHAR_BLOCKED:
        ui.messageBox('Create character is blocked.');
        break;
      case RESULT_CREATE_CHAR_NEED_PREMIUM:
        ui.messageBox('Pay2win');
        break;
      }
    });
  });

  dialog.on('cancel', function() {
    charSelectDialog.show();
    scene.remove(charObj.rootObj);
    visibleCharacter.visible = true;
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
