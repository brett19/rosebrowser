'use strict';

/**
 * @constructor
 */
function SkillDataManager() {
  this.data = null;
  this.strings = null;
}

SkillDataManager.prototype.getData = function(skillNo) {
  return this.data.row(skillNo);
};

SkillDataManager.prototype.getName = function(skillNo) {
  var itemKey = this.data.item(skillNo, this.data.columnCount - 1);
  return this.strings.getByKey(itemKey).text;
};

SkillDataManager.prototype.getDescription = function(skillNo) {
  var itemKey = this.data.item(skillNo, this.data.columnCount - 1);
  return this.strings.getByKey(itemKey).comment;
};

/**
 * Load helper so the ItemDataManager can be controlled by the GDM.
 *
 * @param path Ignores
 * @param callback
 */
SkillDataManager.load = function(path, callback) {
  var waitAll = new MultiWait();
  var mgr = new SkillDataManager();
  DataTable.load('3DDATA/STB/LIST_SKILL.STB', function(waitCallback, data) {
    mgr.data = data;
    waitCallback();
  }.bind(this, waitAll.one()));
  StringTable.load('3DDATA/STB/LIST_SKILL_S.STL', function(waitCallback, data) {
    mgr.strings = data;
    waitCallback();
  }.bind(this, waitAll.one()));
  waitAll.wait(function() {
    callback(mgr);
  });
};
