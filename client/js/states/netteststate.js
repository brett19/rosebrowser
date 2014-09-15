'use strict';

function NetTestState() {
}

NetTestState.prototype.prepare = function(callback) {
  callback();
};

NetTestState.prototype.enter = function() {
  var rUser = 'burtteh';
  var rPass = 'oblivion';

  MsgBoxDialog.create('Test Message', false, function() {
    console.log('dialog okay clicked');
  });

  /*
  var loginClient = new LoginClient();
  loginClient.connect('128.241.92.36', 29000, function(err) {
    console.log('login connected');

    loginClient.login(rUser, rPass, function(data) {
      console.log('login result', data);

      for (var i = 0; i < data.servers.length; ++i) {
        var tServer = data.servers[i];
        console.log(tServer.name);
        if (tServer.name === '1Draconis') {
          loginClient.channelList(tServer.id, function(data) {

            for (var j = 0; j < data.channels.length; ++j) {
              var tChannel = data.channels[j];
              if (tChannel.name === 'Channel 1') {
                console.log('Found valid Server Channel combo', tServer.id, tChannel.id);

                loginClient.selectServer(tServer.id, tChannel.id, function(data) {
                  loginClient.end();

                  var worldClient = new WorldClient();
                  worldClient.connect(data.worldIp, data.worldPort, data.transferKey1, rPass, function() {
                    console.log('WORLD CONNECTED');

                    worldClient.characterList(function(data) {
                      console.log('world charlist data', data);
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
  */
};

NetTestState.prototype.leave = function() {

};

NetTestState.prototype.update = function(delta) {
};

var gsNetTest = new NetTestState();
