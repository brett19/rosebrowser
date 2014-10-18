var ROSELoader = require('./rose');

function QuestLogicData() {

}

QuestLogicData.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var data = new QuestLogicData();

    var size = rh.readUint32();
    var scriptCount = rh.readUint32();
    /* name */ rh.readUint16Str();

    function readStrQuestData() {
      var vardata = {};
      vardata.varNo = rh.readUint16();
      vardata.varType = rh.readUint16();
      vardata.value = rh.readUint16();
      vardata.op = rh.readUint8();
      /* padding */ rh.skip(1);
      return vardata;
    }

    function readStrAbilData() {
      var abildata = {};
      abildata.type = rh.readInt32();
      abildata.value = rh.readInt32();
      abildata.op = rh.readUint8();
      /* padding */ rh.skip(3);
      return abildata;
    }

    function readStrItemData() {
      var itmdata = {};
      itmdata.itemSn = rh.readUint32();
      itmdata.where = rh.readInt32();
      itmdata.count = rh.readInt32();
      itmdata.op = rh.readUint8();
      /* padding */ rh.skip(3);
      return itmdata;
    }

    data.scripts = [];
    for (var i = 0; i < scriptCount; ++i) {
      var script = {};

      var triggerCount = rh.readUint32();
      /* script name */ rh.readUint16Str();

      script.triggers = [];
      var previousTrigger = null;
      for (var j = 0; j < triggerCount; ++j) {
        var trigger = {};

        trigger.checkNext = rh.readUint8() !== 0;
        var condCount = rh.readUint32();
        var rewdCount = rh.readUint32();
        trigger.name = rh.readUint16Str();

        if (previousTrigger) {
          previousTrigger.nextTriggerName = trigger.name;
        }
        previousTrigger = trigger;

        trigger.conditions = [];

        for (var k = 0; k < condCount; ++k) {
          var ins = {};
          var triggerRhStart = rh.tell();
          var insSize = rh.readUint32();
          ins.type = rh.readUint32();
          switch (ins.type) {
            // Quest Selection
            case 0:
              ins.questID = rh.readUint32();
              break;
            // Quest Variable/Switch/Timer Check
            case 1:
              var varCount = rh.readInt32();
              ins.vars = [];
              for (var l = 0; l < varCount; ++l) {
                ins.vars.push(readStrQuestData());
              }
              break;
            // Quest Progress Variable Check
            case 2:
              var varCount = rh.readInt32();
              ins.vars = [];
              for (var l = 0; l < varCount; ++l) {
                ins.vars.push(readStrQuestData());
              }
              break;
            // Character Ability Check
            case 3:
              var abilCount = rh.readInt32();
              ins.abils = [];
              for (var l = 0; l < abilCount; ++l) {
                ins.abils.push(readStrAbilData());
              }
              break;
            // Check Character Item
            case 4:
              var itemCount = rh.readInt32();
              ins.items = [];
              for (var l = 0; l < itemCount; ++l) {
                ins.items.push(readStrItemData());
              }
              break;
            // Party Check
            case 5:
              ins.isLeader = rh.readUint8() !== 0;
              /* padding */ rh.skip(3);
              ins.level = rh.readInt32();
              ins.reversed = rh.readUint8() !== 0;
              /* padding */ rh.skip(3);
              break;
            // Location Check
            case 6:
              ins.zoneNo = rh.readInt32();
              ins.x = rh.readInt32();
              ins.y = rh.readInt32();
              ins.z = rh.readInt32();
              ins.radius = rh.readInt32();
              break;
            // World Time Check
            case 7:
              ins.time = rh.readUint32();
              ins.endTime = rh.readUint32();
              break;
            // Registered Quest - Time Remaining
            case 8:
              ins.time = rh.readUint32();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // Character Skill Check
            case 9:
              ins.skillNo1 = rh.readInt32();
              ins.skillNo2 = rh.readInt32();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // NPC Variable Examine/Change
            case 11:
              ins.who = rh.readUint8();
              /* padding */ rh.skip(1);
              ins.varNo = rh.readInt16();
              ins.value = rh.readInt32();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // Select NPC
            case 13:
              ins.npcNo = rh.readInt32();
              break;
            // Check Quest Switch (Character)
            case 14:
              ins.id = rh.readInt16();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(1);
              break;
            // Check Team Size - Party/Arena Group/Game Arena
            case 15:
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              ins.teamNo = rh.readInt32();
              ins.min = rh.readInt32();
              ins.max = rh.readInt32();
              break;
            // Zone Time Check
            case 16:
              ins.who = rh.readUint8();
              ins.time = rh.readUint32();
              ins.endTime = rh.readUint32();
              break;
            // Team Number Check
            case 20:
              ins.no1 = rh.readInt32();
              ins.no2 = rh.readInt32();
              break;
            // Clan Registration Check
            case 23:
              ins.reg = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // Clan Position (Rank) Check
            case 24:
              ins.pos = rh.readInt16();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(1);
              break;
            // Clan Contribution/Participation Check
            case 25:
              ins.cont = rh.readInt16();
              ins.op = rh.readUint8();
              break;
            // Clan Grade Check
            case 26:
              ins.grd = rh.readInt16();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(1);
              break;
            // Clan Points Check
            case 27:
              ins.point = rh.readInt32();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // Clan Money Check
            case 28:
              ins.money = rh.readInt32();
              ins.op = rh.readUint8();
              break;
            // Number of Clan Members
            case 29:
              ins.memberCnt = rh.readInt16();
              ins.op = rh.readUint8();
              break;
            // Clan Skill Check
            case 30:
              ins.skill1 = rh.readInt16();
              ins.skill2 = rh.readInt16();
              ins.op = rh.readUint8();
              break;
            // Quest Log Activity
            case 31:
              ins.questNo = rh.readUint32();
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;
            // Check Quest Trigger Condition
            case 32:
              ins.op = rh.readUint8();
              /* padding */ rh.skip(1);
              ins.triggerName = rh.readUint16Str();
              /* padding */ rh.skip(3);
              break;
            // Daily Quest / Quest Log Status
            case 36:
              ins.op = rh.readUint8();
              /* padding */ rh.skip(3);
              break;

            // ?? - Client Always True
            case 10:
            case 18:
            case 21:
            case 22:
            case 33:
            case 34:
            case 37:
            case 38:
              rh.skip(insSize - 8);
              // Null the instruction and don't even bother storing it
              ins = null;
              break;

            default:
              console.warn('Encountered unknown condition type:', ins.type);
              rh.skip(insSize - 8);
              break;
          }
          var totalRead = rh.tell() - triggerRhStart;
          if (totalRead !== insSize) {
            console.warn('Encountered corrupt condition trigger:', ins.type, '(read:', totalRead, 'expected:', insSize + ')');
            rh.seek(triggerRhStart + insSize);
          }
          if (ins) {
            trigger.conditions.push(ins);
          }
        }

        for (var k = 0; k < rewdCount; ++k) {
          rh.skip(rh.readUint32() - 4);
        }

        script.triggers.push(trigger);
      }

      if (previousTrigger && previousTrigger.checkNext) {
        previousTrigger.checkNext = false;
        //console.warn('Last trigger in QuestList had checkNext set!');
      }

      data.scripts.push(script);
    }

    callback(data);
  });
};

module.exports = QuestLogicData;
