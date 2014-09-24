'use strict';

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

function QuestScriptManager() {
  this.triggers = {};
}

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

function _checkJobMatch(jobIdx, searchJobIdx) {
  console.warn('Unimplemented Condition!', 'JobMatch', jobIdx, searchJobIdx);
  return false;
}

function _checkAbility(abilType, value, op) {
  var userValue = MC.getAbilityValue(abilType);
  qsdConsole.debug('Check Ability', abilType, '['+enumToName(ABILTYPE,abilType)+']', ':'+userValue, _CHECKOPNAME[op], value)
  if (abilType !== ABILTYPE.CLASS) {
    return _checkOp(op, userValue, value);
  } else {
    return _checkJobMatch(userValue, value);
  }
}

function _checkCond(ins) {
  qsdConsole.group('Check Condition', ins);
  var wasSuccess = true;
  switch (ins.type) {
    case 0:
      qsdConsole.debug('Set Quest', ins.questNo);
      break;
    case 3:
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
    case 4:
      qsdConsole.group('Check Quest Items');
      for (var i = 0; i < ins.items.length; ++i) {
        console.debug(ins.items[i]);
        console.warn('Unimplemented Condition!', ins);
      }
      qsdConsole.groupEnd();
      break;
    case 9:
      qsdConsole.debug('Skill Check', ins.skillNo1, ins.skillNo2, ins.op);
      console.warn('Unimplemented Condition!', ins);
      break;
    case 13:
      qsdConsole.debug('Set NPC', ins.npcNo);
      console.warn('Unimplemented Condition!', ins);
      break;
    case 31:
      qsdConsole.debug('Quest Log Activity', ins.questNo, ins.op);
      console.warn('Unimplemented Condition!', ins);
      break;
    default:
      console.warn('Encountered unhandled condition type:', ins.type);
      break;
  }
  qsdConsole.debug( wasSuccess ? 'SUCCESS' : 'FAILED');
  qsdConsole.groupEnd();
  return wasSuccess;
}

function _checkTrigger(trigger) {
  var wasSuccess = true;
  qsdConsole.group('QSD Check Trigger', trigger.name);
  for (var i = 0; i < trigger.conditions.length; ++i) {
    if (!_checkCond(trigger.conditions[i])) {
      wasSuccess = false;
      break;
    }
  }
  qsdConsole.debug( wasSuccess ? 'SUCCESS' : 'FAILED');
  qsdConsole.groupEnd();
  return wasSuccess;
}

QuestScriptManager.prototype.checkOnly = function(triggerName) {
  var wasSuccess = true;
  qsdConsole.group('QSD Check Only', triggerName);
  while (true) {
    var trigger = this.triggers[triggerName];
    if (!_checkTrigger(trigger)) {
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
    for (var i = 0; i < qdata.rows.length; ++i) {
      (function(entryIdx, dataRow) {
        var filePath = normalizePath(dataRow[0]).toUpperCase();
        if (knownServerOnlyQsds.indexOf(filePath) !== -1) {
          // Skip It!
          return;
        }

        if (dataRow[0] && !dataRow[1]) {
          var questListWait = waitAll.one();

          QuestScriptList.load(dataRow[0], function (qsdData) {

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
      })(i, qdata.rows[i]);
    }
    dataTableWait();
  });
  waitAll.wait(function() {
    callback(data);
  });
};
