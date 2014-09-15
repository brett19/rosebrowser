'use strict';

var rUser = null;
var rPass = null;

function LoginState() {
  this.DM = new DataManager();
}

LoginState.prototype.prepare = function(callback) {
  this.DM.register('canim_intro', Animation, '3DDATA/TITLEIROSE/CAMERA01_INTRO01.ZMO');
  this.DM.register('canim_inselect', Animation, '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO');
  this.DM.register('canim_ingame', Animation, '3DDATA/TITLEIROSE/CAMERA01_INGAME01.ZMO');
  this.DM.register('canim_create', Animation, '3DDATA/TITLEIROSE/CAMERA01_CREATE01.ZMO');
  this.DM.register('canim_outcreate', Animation, '3DDATA/TITLEIROSE/CAMERA01_OUTCREATE01.ZMO');

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
  this.world = null;
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

  this.world = new WorldManager();
  this.world.rootObj.position.set(5200, 5200, 0);
  this.world.setMap(4, function() {
    console.log('Map Ready');
  });
  scene.add(this.world.rootObj);

  this.playCamAnim('canim_intro');

  LoginDialog.show();
  LoginDialog.setUsername('Burtteh');
  LoginDialog.setPassword('oblivion');
  LoginDialog.on('loginClicked', function() {
    self._beginLogin();
  });

  // For Testing
  LoginDialog.emit('loginClicked');
};

var CHARPOSITIONS = [
  new THREE.Vector3(5205.00, 5205.00, 1.00),
  new THREE.Vector3(5202.70, 5206.53, 1.00),
  new THREE.Vector3(5200.00, 5207.07, 1.00),
  new THREE.Vector3(5197.30, 5206.53, 1.00),
  new THREE.Vector3(5195.00, 5205.00, 1.00)
];

LoginState.prototype._beginCharSelect = function(charData) {
  var self = this;

  console.log('begin char select', charData);

  for (var i = 0; i < charData.characters.length; ++i) {
    (function(charIdx, charInfo) {
      console.log('Char', charIdx, charInfo);

      var charObj = new Avatar();
      charObj.setGender(0, function() {
        for (var j = 0; j < AVTBODYPART.Max; ++j) {
          charObj.setModelPart(j, charInfo.parts[j].itemNo);
        }

        var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
        Animation.load(animPath, function(zmoData) {
          var anim = zmoData.createForSkeleton('test', charObj.rootObj, charObj.skel);
          anim.play();
        });
      });
      charObj.rootObj.position.copy(CHARPOSITIONS[charIdx]);
      charObj.rootObj.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI);
      charObj.rootObj.scale.set(1.2, 1.2, 1.2);
      scene.add(charObj.rootObj);
    })(i, charData.characters[i]);
  }

  console.log('INSELECT STARTED');
  this.playCamAnim('canim_inselect', 1, 8, function() {
    console.log('INSELECT DONE');

    if (charData.characters.length < 1) {
      MsgBoxDialog.create('Failed to Login.  No Characters...');
      return;
    }

    var pickCharName = charData.characters[0].name;

    var waitDialog = MsgBoxDialog.create('Joining game...  [Force Character ' + pickCharName + ']', false);

    netWorld.selectCharacter(pickCharName, function(data) {

      console.log('char picked', data);

      netGame = new GameClient();
      netGame.connect(data.gameIp, data.gamePort, data.transferKey1, rPass, function () {
        console.log('GAME CONNECTED');

        waitDialog.close();

        console.log('INGAME STARTED');
        self.playCamAnim('canim_ingame', 1, 8, function() {
          console.log('INGAME DONE');
        });
      });

    });

  });
};

LoginState.prototype._beginLogin = function() {
  var self = this;
  rUser = LoginDialog.getUsername();
  rPass = LoginDialog.getPassword();

  console.log('Starting Login', rUser);

  LoginDialog.hide();

  var waitDialog = MsgBoxDialog.create('Logging in...  [Force Server Draconis]', false);

  netLogin = new LoginClient();
  netLogin.connect('128.241.92.36', 29000, function (err) {
    console.log('login connected');

    netLogin.login(rUser, rPass, function (data) {
      console.log('login result', data);

      for (var i = 0; i < data.servers.length; ++i) {
        var tServer = data.servers[i];
        console.log(tServer.name);
        if (tServer.name === '1Draconis') {
          netLogin.channelList(tServer.id, function (data) {

            for (var j = 0; j < data.channels.length; ++j) {
              var tChannel = data.channels[j];
              if (tChannel.name === 'Channel 1') {
                console.log('Found valid Server Channel combo', tServer.id, tChannel.id);

                netLogin.selectServer(tServer.id, tChannel.id, function (data) {
                  netLogin.end();

                  netWorld = new WorldClient();
                  netWorld.connect(data.worldIp, data.worldPort, data.transferKey1, rPass, function () {
                    console.log('WORLD CONNECTED');

                    netWorld.characterList(function (data) {
                      console.log('world charlist data', data);

                      waitDialog.close();
                      self._beginCharSelect(data);
                    });

                  });

                  console.log('select server data', data);
                });
              }
            }
            console.log('got channel reply', data);

          });
          break;
        }
      }

    });
  });
};

LoginState.prototype.leave = function() {

};

LoginState.prototype.update = function(delta) {

};

var gsLogin = new LoginState();
