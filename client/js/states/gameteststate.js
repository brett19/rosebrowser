'use strict';

/*
This gamestate fakes the login screen by doing all the networking,
and then jumps you immediately to the GameState state.
 */

/**
 * @constructor
 */
function GameTestState() {
  State.call(this);
}
GameTestState.prototype = new State();

GameTestState.prototype.prepare = function(callback) {
  callback();
};

GameTestState.prototype.enter = function() {
  // Grab user/pass from local storage
  var rUser = localStorage.getItem('autologin_user');
  var rPass = localStorage.getItem('autologin_pass');
  var rServer = localStorage.getItem('autologin_server');
  var rChar = localStorage.getItem('autologin_char');

  // Help out by setting some initial but blank entries.
  if (!rUser) {
    localStorage.setItem('autologin_user', '');
  }
  if (!rPass) {
    localStorage.setItem('autologin_pass', '');
  }
  if (!rServer) {
    localStorage.setItem('autologin_server', '1Draconis');
  }
  if (!rChar) {
    localStorage.setItem('autologin_char', '');
  }

  // Make sure we have some user details
  if (!rUser || !rPass) {
    console.warn('You must specify roseuser and rosepass in LocalStorage!');
    return;
  }

  var waitDialog = ui.statusDialog('Connecting...');
  var serverIp = '128.241.92.44';
  var serverName = '!Pegasus';
  var channelName = '1channel1';
  var USE_LIVE_SERVER = true;
  if (USE_LIVE_SERVER) {
    serverIp = '128.241.92.36';
    serverName = '1Draconis';
    channelName = 'Channel 1';

    if (rServer) {
      serverName = rServer;
    }
  }

  // TODO: Move somewhere nice as this is loaded in loginstate
  GDM.get('zone_names', 'list_zone', 'list_status');

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

              if (rChar) {
                pickCharName = rChar;
              }

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

StateManager.register('gametest', GameTestState);
var gsGameTest = StateManager.get('gametest');
