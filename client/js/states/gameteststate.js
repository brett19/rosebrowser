'use strict';

/*
This gamestate fakes the login screen by doing all the networking,
and then jumps you immediately to the GameState state.
 */

function GameTestState() {
}

GameTestState.prototype.prepare = function(callback) {
  callback();
};

GameTestState.prototype.enter = function() {
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

  // Make sure we have some user details
  if (!rUser || !rPass) {
    console.warn('You must specify roseuser and rosepass in LocalStorage!');
    return;
  }

  var waitDialog = MsgBoxDialog.create('Connecting...', false);

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
              waitDialog.setMessage('Loaded characters; Selecting one.');

              if (data.characters.length === 0) {
                console.log(data.characters);
                waitDialog.setMessage('Failed to find a character.');
                netWorld.end();
                return;
              }

              var pickCharName = data.characters[0].name;
              netWorld.selectCharacter(pickCharName, function(data) {
                waitDialog.setMessage('Character Selected. Connecting to Game Server.');

                netGame = new GameClient();
                netGame.connect(data.gameIp, data.gamePort, data.transferKey1, rPass, function () {
                  waitDialog.setMessage('Connected to Game Server; Waiting for character data.');

                  var charData = null;
                  var invData = null;
                  var questLog = null;
                  var questVars = null;
                  var questItems = null;
                  var dailyQuestLog = null;
                  var targetMap = null;
                  netGame.on('char_data', function(data) {
                    charData = data;
                  });
                  netGame.on('inventory_data', function(data) {
                    invData = data;
                  });
                  netGame.on('quest_log', function(data) {
                    questLog = data;
                  });
                  netGame.on('quest_vars', function(data) {
                    questVars = data;
                  });
                  netGame.on('questitem_list', function(data) {
                    questItems = data;
                  });
                  netGame.on('quest_completion_data', function(data) {
                    dailyQuestLog = data;
                  });
                  netGame.on('preload_char', function(data) {
                    if (data.state === 2) {
                      if (!charData || !invData || !questLog ||
                          !questVars || !questItems || !dailyQuestLog) {
                        waitDialog.setMessage('Got preload 2 without all data.');
                        netWorld.end();
                        netGame.end();
                        return;
                      }

                      waitDialog.setMessage('Ready to roll!  Preparing Map!');

                      // Time to switch states!
                      gsGame.setMap(charData.zoneNo);
                      gsGame.prepare(function() {
                        var startPos = new THREE.Vector3(
                            charData.posStart.x,
                            charData.posStart.y,
                            0);
                        gsGame.worldMgr.setViewerInfo(startPos, function() {
                          gsGame.worldMgr.rootObj.updateMatrixWorld();

                          NetManager.world = gsGame.worldMgr;
                          NetManager.watch(netWorld, netGame);

                          MC = new MyCharacter();
                          MC.world = gsGame.worldMgr;
                          MC.name = charData.name;
                          MC.level = charData.level;
                          MC.position.x = charData.posStart.x;
                          MC.position.y = charData.posStart.y;
                          MC.mp = charData.mp;
                          MC.gender = charData.gender;
                          MC.stats = charData.stats;
                          MC.job = charData.job;
                          MC.hairColor = charData.hairColor;
                          MC.visParts = charData.parts;
                          MC.money = invData.money;
                          MC.inventory = InventoryData.fromPacketData(invData.items);
                          MC.debugValidate();
                          MC.dropFromSky();
                          GOM.addObject(MC);

                          console.log('MC Loaded', MC);

                          waitDialog.close();
                          gsGameTest.leave();
                          gsGame.enter();
                          activeGameState = gsGame;

                        });
                      });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

GameTestState.prototype.leave = function() {

};

GameTestState.prototype.update = function(delta) {
};

var gsGameTest = new GameTestState();
