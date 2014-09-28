'use strict';

var gameWorld = null;

/**
 * @constructor
 */
function PreGameState() {
  State.call(this);

  this.waitDialog = null;
}
PreGameState.prototype = new State();

PreGameState.prototype.enter = function() {
  LoadScreen.show();

  // We must immediately begin listening for these events, or we risk loosing
  //   them because of missing the emitted event.
  var charData = null;
  var invData = null;
  var questLog = null;
  var questVars = null;
  var questItems = null;
  var dailyQuestLog = null;
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

  var waitDialog = GUI.newStatusDialog();
  waitDialog.setMessage('Downloading Character Data...');
  this.waitDialog = waitDialog;

  netGame.on('preload_char', function(data) {
    if (data.state === 2) {
      if (!charData || !invData || !questLog ||
          !questVars || !questItems || !dailyQuestLog) {
        // TODO: Make this do the right thing instead...
        waitDialog.setMessage('Got preload 2 without all data.');
        netWorld.end();
        netGame.end();
        return;
      }

      waitDialog.setMessage('Ready to roll!  Preparing Map!');

      gameWorld = new WorldManager();
      gameWorld.setMap(charData.zoneNo, function() {
        var startPos = new THREE.Vector3(
            charData.posStart.x,
            charData.posStart.y,
            0);
        gameWorld.setViewerInfo(startPos, function() {
          gameWorld.rootObj.updateMatrixWorld();

          NetManager.world = gameWorld;
          NetManager.watch(netWorld, netGame);

          MC = new MyCharacter();
          MC.world = gameWorld;
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
          MC.inventory = InventoryData.fromPacketData(invData);
          MC.debugValidate();

          // TODO: This should be set when the real index is received after
          //   joining the zone, and addObject should follow that.
          MC.serverObjectIdx = 9999999;
          MC.dropFromSky();
          GOM.addObject(MC);

          console.log('MC Loaded', MC);

          StateManager.prepare('game', function() {
            waitDialog.close();
            StateManager.switch('game');
          });
        });
      });
    }
  });
};

PreGameState.prototype.leave = function() {
  LoadScreen.hide();
};


StateManager.register('pregame', PreGameState);
