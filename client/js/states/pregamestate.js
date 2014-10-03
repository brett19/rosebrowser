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

  var waitDialog = ui.statusDialog('Downloading Character Data...');
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
          MC.gender = charData.gender;
          MC.position.x = charData.posStart.x;
          MC.position.y = charData.posStart.y;
          MC.zoneNo = charData.zoneNo; // TODO: Move this to another object? gameWorld.zoneNo
          MC.reviveZoneNo = charData.reviveZoneNo;
          MC.visParts = charData.parts;

          // tagBasicINFO
          MC.birthStone = charData.birthStone;
          MC.hairColor = charData.hairColor;
          MC.job = charData.job;
          MC.union = charData.union;
          MC.rank = charData.rank;
          MC.fame = charData.fame;

          // tagGrowABility
          MC.hp = charData.hp;
          MC.mp = charData.mp;
          MC.xp = charData.exp;
          MC.level = charData.level;
          MC.statPoints = charData.bonusPoint;
          MC.skillPoints = charData.skillPoint;
          MC.bodySize = charData.bodySize;
          MC.headSize = charData.headSize;
          MC.penaltyXP = charData.penalExp;
          MC.fameG = charData.fameG;
          MC.fameB = charData.fameB;
          MC.pkFlag = charData.pkFlag;
          MC.stamina = charData.stamina;
          MC.patHp = charData.patHp;
          MC.patCoolTime = charData.patCoolTime;

          // tagBasicAbility
          MC.stats = new McStats(MC);
          MC.stats.str = charData.stats.str;
          MC.stats.dex = charData.stats.dex;
          MC.stats.int = charData.stats.int;
          MC.stats.con = charData.stats.con;
          MC.stats.cha = charData.stats.cha;
          MC.stats.sen = charData.stats.sen;

          // TODO: charData.currency
          // TODO: charData.maintainStatus
          // TODO: charData.hotIcons
          // TODO: charData.coolTime

          // Inventory
          MC.inventory = InventoryData.fromPacketData(invData);

          // Quests
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
