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
    if (data.result === 0x1) {
      invData = data;
    } else {
      invData.items = invData.items.concat(data.items);
    }
  });

  // TODO: Maybe remove these from here - they can be sent any time, not only on login
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

  var waitDialog = ui.statusDialog();
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
          MC.hp = charData.hp;
          MC.mp = charData.mp;
          MC.gender = charData.gender;
          MC.job = charData.job;
          MC.hairColor = charData.hairColor;
          MC.visParts = charData.parts;
          MC.stats = new McStats(MC);
          MC.stats.str = charData.stats.str;
          MC.stats.dex = charData.stats.dex;
          MC.stats.int = charData.stats.int;
          MC.stats.con = charData.stats.con;
          MC.stats.cha = charData.stats.cha;
          MC.stats.sen = charData.stats.sen;
          MC.inventory = InventoryData.fromPacketData(invData);
          MC.quests = QuestData.fromPacketData(questLog.quests, questVars.vars, questItems.items, dailyQuestLog.dailyLog);
          // MC validation and GOM addition defered to after JOIN_ZONE.

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
