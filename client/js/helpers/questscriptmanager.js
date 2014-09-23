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

function _checkOp(op, left, right) {
  switch (op) {
    case 0: return left === right;
    case 1: return left > right;
    case 2: return left >= right;
    case 3: return left < right;
    case 4: return left <= right;
    case 10: return left !== right;
  }

  console.warn('Encountered unknown trigger opcode:', op);
  return false;
}

function _checkCond(ins) {
  switch (ins.type) {
    case 0:
      console.log('set quest', ins.questNo);
      break;
    case 3:
      console.group('check abilitys');
      for (var i = 0; i < ins.abils.length; ++i) {
        console.log(ins.abils[i]);
      }
      console.groupEnd();
      break;
    case 4:
      console.group('check items');
      for (var i = 0; i < ins.items.length; ++i) {
        console.log(ins.items[i]);
      }
      console.groupEnd();
      break;
    case 9:
      console.log('skill check', ins.skillNo1, ins.skillNo2, ins.op);
      break;
    case 13:
      console.log('set npc', ins.npcNo);
      break;
    case 31:
      console.log('quest log activity', ins.questNo, ins.op);
      break;
    default:
      console.warn('Encountered unhandled condition type:', ins.type);
      break;
  }
  return true;
}
function _checkTrigger(trigger) {
  console.log('checkTrigger', trigger.name);
  for (var i = 0; i < trigger.conditions.length; ++i) {
    if (!_checkCond(trigger.conditions[i])) {
      return false;
    }
  }
  return true;
}

QuestScriptManager.prototype.checkOnly = function(triggerName) {
  while (true) {
    var trigger = this.triggers[triggerName];
    if (!_checkTrigger(trigger)) {
      return false;
    }
    if (trigger.checkNext) {
      triggerName = trigger.nextTriggerName;
    } else {
      break;
    }
  }
  return true;
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
