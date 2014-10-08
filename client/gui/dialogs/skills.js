'use strict';
ui.loadTemplateFile('skills.html');

ui.SkillsDialog = function(skills) {
  ui.Dialog.call(this, 'skills.html');

  this._skills = ui.panel(this, '.panel.skills');

  this._data = skills;
  this._data.on('changed', this._update.bind(this));
  this._update();
}

ui.SkillsDialog.prototype = Object.create(ui.Dialog.prototype);

ui.SkillsDialog.prototype._update = function() {
  this._skills._element.html('');

  for (var i = 0; i < this._data.skills.length; ++i) {
    var id = '.skills-slot-' + i;
    var slot = ui.iconslot(id);
    slot.setIcon(HOT_ICON_TYPE.SKILL, this._data.skills[i]);
    slot.on('swap', this._swapSlot.bind(this, slot));
    this._skills.append(slot);
  }
};

ui.SkillsDialog.prototype._swapSlot = function(slot, dst) {
  var srcSkill = slot.icon();
  var match = dst.match(/^quick-slot-([0-9]*)$/);

  if (match) {
    var quickbarSlot = match[1];
    netGame.setHotIcon(match[1], HOT_ICON_TYPE.SKILL, srcSkill.slot);
  }
};

ui.skillsDialog = function(skills) {
  return new ui.SkillsDialog(skills);
};
