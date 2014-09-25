'use strict';

var rUser = null;
var rPass = null;

function LoginState() {
  this.DM = new DataManager();
}

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

  CharSelDialog.on('select_char', function(charIdx) {
    self._onSelectChar(charIdx);
  });
  CharSelDialog.on('confirm_char', function() {
    self._onConfirmChar();
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

    netGame = new GameClient();
    netGame.connect(data.gameIp, data.gamePort, data.transferKey1, rPass, function () {
      waitDialog.setMessage('Connected to Game Server; Waiting for character data.');

      var charData = null;
      var invData = null;

      var targetMap = null;
      netGame.on('char_data', function(data) {
        charData = data;
      });
      netGame.on('inventory_data', function(data) {
        invData = data;
      });
      netGame.on('preload_char', function(data) {
        if (data.state === 2) {
          if (!charData || !invData) {
            waitDialog.setMessage('Got preload 2 without all data.');
            netWorld.end();
            netGame.end();
            return;
          }

          waitDialog.setMessage('Ready to roll!  Preparing Map!');

          // Time to switch states!
          gsGame.setMap(charData.zoneNo);
          StateManager.prepare('game', function() {
            var startPos = new THREE.Vector3(
                charData.posStart.x,
                charData.posStart.y,
                0);
            gsGame.worldMgr.setViewerInfo(startPos, function() {
              gsGame.worldMgr.rootObj.updateMatrixWorld();

              NetManager.world = gsGame.worldMgr;
              NetManager.watch(netWorld, netGame);

              MC = new MyCharacter(gsGame.worldMgr);
              MC.name = charData.name;
              MC.level = charData.level;
              MC.setPosition(charData.posStart.x, charData.posStart.y, 0);
              MC.dropFromSky();
              MC.gender = charData.gender;
              MC.visParts = charData.parts;
              GOM.addObject(MC);

              waitDialog.close();
              StateManager.switch('game');

            });
          });
        }
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

  debugGui.add(this, 'playNextAnim');

  this.world = new WorldManager();
  this.world.rootObj.position.set(5200, 5200, 0);
  this.world.setMap(7, function() {
    console.log('Map Ready');
    self.world.setViewerInfo(null);
  });

  scene.add(this.world.rootObj);

  this.playCamAnim('canim_intro');

  LoginDialog.show();
  LoginDialog.on('loginClicked', function() {
    self._beginLogin();
  });

  // Grab user/pass from local storage
  var rUser = localStorage.getItem('roseuser');
  var rPass = localStorage.getItem('rosepass');

  // Help out by setting some initial but blank entries.
  if (!rUser) {
    localStorage.setItem('roseuser', '');
  }
  if (!rPass) {
    localStorage.setItem('rosepass', '');
  }

  if (rUser) {
    LoginDialog.setUsername(rUser);
  }
  if (rPass) {
    LoginDialog.setPassword(rPass);
  }

  // For testing, skip login if local storage is set...
  if (rUser && rPass) {
    LoginDialog.emit('loginClicked');
  }
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

        charObj.setMotion(AVTANI.STOP1);
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

  CharSelDialog.setCharacters(this.chars);
  CharSelDialog.selectCharacter(0);

  console.log('INSELECT STARTED');
  this.playCamAnim('canim_inselect', 1, 8, function() {
    console.log('INSELECT DONE');

    CharSelDialog.show();
  });
};

LoginState.prototype._beginLogin = function() {
  var self = this;
  rUser = LoginDialog.getUsername();
  rPass = LoginDialog.getPassword();

  console.log('Starting Login', rUser);

  LoginDialog.hide();

  var waitDialog = MsgBoxDialog.create('Logging in...', false);

  var serverIp = '128.241.92.44';
  var serverName = '!Pegasus';
  var channelName = '1channel1';
  var USE_LIVE_SERVER = true;
  if (USE_LIVE_SERVER) {
    serverIp = '128.241.92.36';
    serverName = '1Draconis';
    channelName = 'Channel 1';
  }

  netLogin = new LoginClient();
  netLogin.connect(serverIp, 29000, function(err) {
    waitDialog.setMessage('Connected; Logging In.');

    netLogin.login(rUser, rPass, function (data) {
      if ((data.result & 0x7f) !== NETLOGINREPLY.OK) {
        waitDialog.setMessage('Failed to Login (' + enumToName(NETLOGINREPLY, data.result) + ').');
        netLogin.end();
        return;
      }
      waitDialog.setMessage('Logged In; Finding Server.');

      var serverIdx = -1;
      for (var i = 0; i < data.servers.length; ++i) {
        var tServer = data.servers[i];
        if (tServer.name === serverName) {
          serverIdx = tServer.id;
          break;
        }
      }

      if (serverIdx < 0) {
        console.log(data.servers);
        waitDialog.setMessage('Failed to find a server.');
        netLogin.end();
        return;
      }

      netLogin.channelList(serverIdx, function (data) {
        waitDialog.setMessage('Found Server; Retrieving endpoint info.');

        var channelIdx = -1;
        for (var j = 0; j < data.channels.length; ++j) {
          var tChannel = data.channels[j];
          if (tChannel.name === channelName) {
            channelIdx = tChannel.id;
          }
        }

        if (channelIdx < 0) {
          console.log(data.channels);
          waitDialog.setMessage('Failed to find a channel.');
          netLogin.end();
          return;
        }

        netLogin.selectServer(tServer.id, tChannel.id, function (data) {
          waitDialog.setMessage('Found Endpoint; Connecting to World Server.');
          netLogin.end();

          netWorld = new WorldClient();
          netWorld.connect(data.worldIp, data.worldPort, data.transferKey1, rPass, function () {
            waitDialog.setMessage('Connected to World Server.  Loading characters.');

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
};

StateManager.register('login', LoginState);
