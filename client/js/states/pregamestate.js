var StateManager = require('./statemanager');
var State = require('./state');

/**
 * @constructor
 */
function PreGameState() {
  State.call(this);
}
PreGameState.prototype = new State();

PreGameState.prototype.enter = function() {
  LoadScreen.show();

  var waitDialog = ui.statusDialog('Downloading Character Data...');

  netGame.once('char_data', function(charData) {
    MC = new MyCharacter();
    MC.inventory = new InventoryData();
    MC.quests = new QuestData();
    MC.hotIcons = new HotIcons();
    MC.skills = new SkillData();
    MC.party = new PartyData();
    MC.ingStatus = new IngStatus();

    MC.name = charData.name;
    MC.uniqueTag = charData.uniqueTag;
    MC.gender = charData.gender;
    MC.position.x = charData.posStart.x;
    MC.position.y = charData.posStart.y;
    MC.zoneNo = charData.zoneNo; // TODO: Move this to another object?
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

    MC.hotIcons.setIcons(charData.hotIcons);

    // TODO: charData.coolTime

    netGame.once('preload_char', function(data) {
      if (data.state !== 1) {
        throw new Error('Got unexpected preload_char state.');
      }

      NetManager.world = GZM.map;
      NetManager.watch(netWorld, netGame);

      waitDialog.setMessage('Downloaded.  Lets rock\'n\'roll!');

      var waitAll = new MultiWait();

      // Prepare the Zone manager
      var startZoneNo = charData.zoneNo;
      var startPos = new THREE.Vector3(
          charData.posStart.x,
          charData.posStart.y,
          0);
      GZM.prepare(startZoneNo, startPos, waitAll.one());
      StateManager.prepare('game', waitAll.one());

      // Wait for all character data to be received
      netGame.once('preload_char', function(waitFn, data) {
        if (data.state !== 2) {
          throw new Error('Got unexpected preload_char state.');
        }
        waitFn();
      }.bind(this, waitAll.one()));

      // Once we have everything, switch states!
      waitAll.wait(function() {
        waitDialog.close();
        StateManager.switch('game');
      });
    });
  });
};

PreGameState.prototype.leave = function() {
  LoadScreen.hide();
};


StateManager.register('pregame', PreGameState);
