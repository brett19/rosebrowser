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
