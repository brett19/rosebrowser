var knownServerOnlyQsds = [
  '3DDATA/QUESTDATA/SERVER/SOLDIER.QSD',
  '3DDATA/QUESTDATA/SERVER/MUSE.QSD',
  '3DDATA/QUESTDATA/SERVER/COMBAT.QSD',
  '3DDATA/QUESTDATA/SERVER/HAWKER.QSD',
  '3DDATA/QUESTDATA/SERVER/DEALER.QSD',
  '3DDATA/QUESTDATA/NPC/QN-350.QSD',
  '3DDATA/QUESTDATA/NPC/QN-070.QSD',
  '3DDATA/QUESTDATA/NPC/QN-380.QSD',
  '3DDATA/QUESTDATA/NPC/QN-2247.QSD',
  '3DDATA/QUESTDATA/NPC/QN-2254.QSD'
];

/**
 * @constructor
 */
function QuestScriptManager() {
  this.triggers = {};
}

// TODO: Move to QSD?
QuestScriptManager.CONDITIONS = {
  SET_ACTIVE_QUEST: 0,
  QUEST_DATA: 1,
  QUEST_VAR: 2,
  ABILITY: 3,
  QUEST_ITEMS: 4,
  PARTY: 5,
  LOCATION: 6,
  WORLD_TIME: 7,
  QUEST_TIME: 8,
  SKILL: 9,
  RANDOM: 10,
  OBJECT_VAR: 11,
  SELECT_EVENT: 12,
  NPC_VAR: 13,
  QUEST_SWITCH: 14,
  PARTY_MEMBERS: 15,
  ZONE_TIME: 16,
  NPC_VAR_COMP: 17, // Compare two NPC's variables
  LOCAL_DATE_TIME: 18, // Date and time
  LOCAL_DAY_TIME: 19, // Day of week and time
  TEAM: 20,
  CLAN: 23,
  CLAN_POS: 24,
  CLAN_USER_POINTS: 25,
  CLAN_LEVEL: 26,
  CLAN_POINTS: 27,
  CLAN_MONEY: 28,
  CLAN_MEMBERS: 29,
  CLAN_SKILL: 30,
  QUEST_LOG_ACTIVITY: 31
};

QuestScriptManager.QuestParam = function() {
  this.questSlot = undefined;
  this.quest = undefined;
};

QuestScriptManager.prototype._registerTrigger = function(trigger) {
  if (this.triggers[trigger.name]) {
    console.error('Encountered trigger twice:', trigger.name);
    return;
  }
  this.triggers[trigger.name] = trigger;
};

var _CHECKOPNAME = [ '==', '>', '>=', '<', '<=', '?', '?', '?', '?', '?', '!=' ];
function _checkOp(op, left, right) {
  if (left instanceof Int64) {
    // Because QSD can only hold 32 bit numbers, we can toNumber and be
    //   confident that any precision loss would occur outside the comparator
    //   number range anyways.
    left = left.toNumber();
  }
  switch (op) {
    case 0: return left === right;
    case 1: return left > right;
    case 2: return left >= right;
    case 3: return left < right;
    case 4: return left <= right;
    case 10: return left !== right;
  }

  console.warn('Encountered unknown trigger cond op:', op);
  return false;
}

function _checkJobMatch(classIdx, jobIdx) {
  var jobData = GDM.getNow('list_class');
  var jobRow = jobData.row(jobIdx);

  if (parseInt(jobRow[1]) === 0) {
    return true;
  }

  for (var i = 1; i <= 12; ++i) {
    if (parseInt(jobRow[i]) === classIdx) {
      return true;
    }
  }

  return false;
}

function _checkAbility(abilType, value, op) {
  var userValue = MC.getAbilityValue(abilType);
  qsdConsole.debug('Check Ability', abilType, '['+enumToName(ABILTYPE,abilType)+']', ':'+userValue, _CHECKOPNAME[op], value);
  if (abilType !== ABILTYPE.CLASS) {
    return _checkOp(op, userValue, value);
  } else {
    return _checkJobMatch(userValue, value);
  }
}

var QUEST_VAR_TYPE = {
  QUEST_VAR:    0,
  QUEST_SWITCH: 0x100,
  QUEST_TIMER:  0x200,
  EPISODE:      0x300,
  JOB:          0x400,
  PLANET:       0x500,
  UNION:        0x600,
  CLAN_WAR:     0x700
};

var INT_FAILED = 0x80000000;

function _getQuestVar(param, type, id) {
  switch (type) {
  case QUEST_VAR_TYPE.QUEST_VAR:
    if (param.questSlot !== undefined) {
      return MC.quests.getQuestVar(param.questSlot, id);
    }
    break;
  case QUEST_VAR_TYPE.QUEST_SWITCH:
    if (param.questSlot !== undefined) {
      return MC.quests.getQuestSwitch(param.questSlot, id);
    }
    break;
  case QUEST_VAR_TYPE.QUEST_TIMER:
    if (param.questSlot !== undefined) {
      return MC.quests.getQuestTimer(param.questSlot);
    }
    break;
  case QUEST_VAR_TYPE.EPISODE:
    return MC.quests.getEpisodeVar(id);
  case QUEST_VAR_TYPE.JOB:
    return MC.quests.getJobVar(id);
  case QUEST_VAR_TYPE.PLANET:
    return MC.quests.getPlanetVar(id);
  case QUEST_VAR_TYPE.UNION:
    return MC.quests.getUnionVar(id);
  }

  return INT_FAILED;
}

function _checkQuestVar(param, type, id, value, op) {
  var userValue = _getQuestVar(param, type, id);

  qsdConsole.debug('Check Quest Variable', type, '['+enumToName(QUEST_VAR_TYPE,type)+']', id, ':'+userValue, _CHECKOPNAME[op], value);

  if (userValue === INT_FAILED) {
    return _checkOp(op, userValue, value);
  } else {
    return false;
  }
}

function _checkQuestItem(param, itemSn, where, count, op) {
  var type = Math.floor(itemSn / 1000);
  var id = itemSn % 1000;
  var quantity = 0;

  if (where >= INVEQUIPIDX.FACE_ITEM && where < INVEQUIPIDX.MAX) {
    // TODO: Check equipment
    console.warn('Unimplemented _checkQuestItem on equipment!');
  } else if (type === ITEMTYPE.QUEST) {
    quantity = MC.quests.getQuestItemQuantity(param.questID, type, id);
  } else {
    // TODO: Check inventory
    console.warn('Unimplemented _checkQuestItem on inventory!');
  }

  qsdConsole.debug('Check Quest Item', itemSn, where, ':'+quantity, _CHECKOPNAME[op], count);
  return _checkOp(op, quantity, count);
}

function _checkParty(param, isLeader, level, reverse) {
  var party = MC.party;
  var success = false;

  qsdConsole.debug('Check Party', isLeader, level, reverse);

  if (!party.exists) {
    return false;
  }

  if (isLeader && party.leaderTag === MC.uniqueTag) {
    success = true;
  }

  if (party.level >= level) {
    success = true;
  }

  return reverse ? !success : success;
}

function _checkCond(param, ins) {
  qsdConsole.group('Check Condition', ins);
  var wasSuccess = true;
  switch (ins.type) {
    case QuestScriptManager.CONDITIONS.SET_ACTIVE_QUEST:
      qsdConsole.debug('Set Active Quest', ins.questID, MC.quests.findQuestByID(ins.questID));
      var slot = MC.quests.findQuestByID(ins.questID);
      if (slot >= 0 && slot < QuestData.QUEST.PLAYER_QUESTS) {
        param.questSlot = MC.quests.findQuestByID(ins.questID);
        param.questID = ins.questID;
      } else {
        wasSuccess = false;
      }
      break;
    case QuestScriptManager.CONDITIONS.QUEST_VAR:
    case QuestScriptManager.CONDITIONS.QUEST_DATA:
      qsdConsole.group('Check Quest Var');
      for (var i = 0; i < ins.vars.length; ++i) {
        var varChk = ins.vars[i];
        if (!_checkQuestVar(param, varChk.varType, varChk.varNo, varChk.value, varChk.op)) {
          wasSuccess = false;
          break;
        }
      }
      qsdConsole.groupEnd();
      break;
    case QuestScriptManager.CONDITIONS.ABILITY:
      qsdConsole.group('Check Abilitys');
      for (var i = 0; i < ins.abils.length; ++i) {
        var abilChk = ins.abils[i];
        if (!_checkAbility(abilChk.type, abilChk.value, abilChk.op)) {
          wasSuccess = false;
          break;
        }
      }
      qsdConsole.groupEnd();
      break;
    case QuestScriptManager.CONDITIONS.QUEST_SWITCH:
      qsdConsole.debug('Check Quest Switch', ins.id, ins.op);

      if (MC.quests.getSwitch(ins.id) !== ins.op) {
        wasSuccess = false;
      }
      break;
    case QuestScriptManager.CONDITIONS.QUEST_ITEMS:
      qsdConsole.group('Check Quest Items');
      for (var i = 0; i < ins.items.length; ++i) {
        var itemChk = ins.items[i];
        if (!_checkQuestItem(param, itemChk.itemSn, itemChk.where, itemChk.count, itemChk.op)) {
          wasSuccess = false;
          break;
        }
        console.debug(ins.items[i]);
      }
      qsdConsole.groupEnd();
      break;
    case QuestScriptManager.CONDITIONS.PARTY:
      if (!_checkParty(param, ins.isLeader, ins.level, ins.reverse)) {
        wasSuccess = false;
      }
      break;
    case QuestScriptManager.CONDITIONS.SKILL:
      qsdConsole.debug('Skill Check', ins.skillNo1, ins.skillNo2, ins.op);
      console.warn('Unimplemented Condition!', ins);
      break;
    case QuestScriptManager.CONDITIONS.NPC_VAR:
      qsdConsole.debug('Set NPC', ins.npcNo);
      console.warn('Unimplemented Condition!', ins);
      break;
    case QuestScriptManager.CONDITIONS.QUEST_LOG_ACTIVITY:
      qsdConsole.debug('Quest Log Activity', ins.questNo, ins.op);
      console.warn('Unimplemented Condition!', ins);
      break;
    case QuestScriptManager.CONDITIONS.LOCATION:
    case QuestScriptManager.CONDITIONS.WORLD_TIME:
    case QuestScriptManager.CONDITIONS.QUEST_TIME:
    case QuestScriptManager.CONDITIONS.RANDOM:
    case QuestScriptManager.CONDITIONS.OBJECT_VAR:
    case QuestScriptManager.CONDITIONS.SELECT_EVENT:
    case QuestScriptManager.CONDITIONS.PARTY_MEMBERS:
    case QuestScriptManager.CONDITIONS.ZONE_TIME:
    case QuestScriptManager.CONDITIONS.NPC_VAR_COMP:
    case QuestScriptManager.CONDITIONS.LOCAL_DATE_TIME:
    case QuestScriptManager.CONDITIONS.LOCAL_DAY_TIME:
    case QuestScriptManager.CONDITIONS.TEAM:
    case QuestScriptManager.CONDITIONS.CLAN:
    case QuestScriptManager.CONDITIONS.CLAN_POS:
    case QuestScriptManager.CONDITIONS.CLAN_USER_POINTS:
    case QuestScriptManager.CONDITIONS.CLAN_LEVEL:
    case QuestScriptManager.CONDITIONS.CLAN_POINTS:
    case QuestScriptManager.CONDITIONS.CLAN_MONEY:
    case QuestScriptManager.CONDITIONS.CLAN_MEMBERS:
    case QuestScriptManager.CONDITIONS.CLAN_SKILL:
    default:
      console.warn('Encountered unhandled condition type:', ins.type);
      break;
  }
  qsdConsole.debug( wasSuccess ? 'SUCCESS' : 'FAILED');
  qsdConsole.groupEnd();
  return wasSuccess;
}

function _checkTrigger(param, trigger) {
  var wasSuccess = true;
  qsdConsole.group('QSD Check Trigger', trigger.name);
  for (var i = 0; i < trigger.conditions.length; ++i) {
    if (!_checkCond(param, trigger.conditions[i])) {
      wasSuccess = false;
      break;
    }
  }
  qsdConsole.debug( wasSuccess ? 'SUCCESS' : 'FAILED');
  qsdConsole.groupEnd();
  return wasSuccess;
}

QuestScriptManager.prototype.checkOnly = function(triggerName) {
  var param = new QuestScriptManager.QuestParam();
  var wasSuccess = true;
  qsdConsole.group('QSD Check Only', triggerName);
  while (true) {
    if (!(triggerName in this.triggers)) {
      qsdConsole.warn('Could not find triggerName in this.triggers', triggerName);
      wasSuccess = false;
      break;
    }

    var trigger = this.triggers[triggerName];
    if (!_checkTrigger(param, trigger)) {
      wasSuccess = false;
      break;
    }

    if (trigger.checkNext) {
      triggerName = trigger.nextTriggerName;
    } else {
      break;
    }
  }
  qsdConsole.debug( wasSuccess ? 'SUCCESS' : 'FAILED');
  qsdConsole.groupEnd();
  return wasSuccess;
}

/**
 * Load helper so the QuestScriptManager can be controlled by the GDM.
 *
 * @param path Path to STB listing the quest scripts
 * @param callback
 */
QuestScriptManager.load = function(path, callback) {
  var data = new QuestScriptManager();

  var waitAll = new MultiWait();
  var dataTableWait = waitAll.one();
  DataTable.load(path, function(qdata) {
    for (var i = 0; i < qdata.rowCount; ++i) {
      (function(entryIdx, dataRow) {
        var filePath = normalizePath(dataRow[0]).toUpperCase();
        if (knownServerOnlyQsds.indexOf(filePath) !== -1) {
          // Skip It!
          return;
        }

        if (dataRow[0] && !dataRow[1]) {
          var questListWait = waitAll.one();

          QuestLogicData.load(dataRow[0], function (qsdData) {

            for (var j = 0; j < qsdData.scripts.length; ++j) {
              var qsdScript = qsdData.scripts[j];
              for (var k = 0; k < qsdScript.triggers.length; ++k) {
                var trigger = qsdScript.triggers[k];
                data._registerTrigger(trigger);
              }
            }

            questListWait();
          });
        }
      })(i, qdata.row(i));
    }
    dataTableWait();
  });
  waitAll.wait(function() {
    callback(data);
  });
};

module.exports = QuestScriptManager;
