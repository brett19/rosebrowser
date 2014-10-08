'use strict';
ui.loadTemplateFile('skills.html');

ui.SkillsDialog = function(skills) {
  ui.Dialog.call(this, 'skills.html');

  ui.tabpanel(this, '.tabpanel.basic');
  ui.tabpanel(this, '.tabpanel.category');
  ui.tabpanel(this, '.tabpanel.parts');
  ui.tabpanel(this, '.tabpanel.unique');
  ui.tabpanel(this, '.tabpanel.pay2win');
  ui.tabpanel(this, '.tabpanel.job');

  this._basicSkills = ui.skillpanel(this, '.skill-panel.basic');
  this._cartSkills = ui.skillpanel(this, '.skill-panel.cart');
  this._castleGearSkills = ui.skillpanel(this, '.skill-panel.castle-gear');

  this._uniqueSkills1 = ui.skillpanel(this, '.skill-panel.unique-1');
  this._uniqueSkills2 = ui.skillpanel(this, '.skill-panel.unique-2');
  this._uniqueSkills3 = ui.skillpanel(this, '.skill-panel.unique-3');
  this._uniqueSkills4 = ui.skillpanel(this, '.skill-panel.unique-4');

  this._pay2winSkills1 = ui.skillpanel(this, '.skill-panel.pay-to-win-1');
  this._pay2winSkills2 = ui.skillpanel(this, '.skill-panel.pay-to-win-2');

  this._jobSkills1 = ui.skillpanel(this, '.skill-panel.job-1');
  this._jobSkills2 = ui.skillpanel(this, '.skill-panel.job-2');
  this._jobSkills3 = ui.skillpanel(this, '.skill-panel.job-3');

  this.center();

  this._data = skills;
  this._data.on('changed', this._update.bind(this));
  this._update();
}

ui.SkillsDialog.prototype = Object.create(ui.Dialog.prototype);

ui.SkillsDialog.prototype._update = function() {
  // TODO: Put in correct locations
  for (var i = 0; i < this._data.skills.length && i < 42; ++i) {
    this._basicSkills.slots[i].setIcon(HOT_ICON_TYPE.SKILL, this._data.skills[i]);
  }
};

ui.SkillsDialog.prototype._onSwap = function(slot, dst) {
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

ui.SkillPanel = function(element) {
  ui.Widget.call(this, element);

  var parent = this.parent('dialog');
  this.slots = [];

  for (var i = 0; i < 42; ++i) {
    var slot = ui.iconslot();
    slot.on('swap', parent._onSwap.bind(parent, slot));
    this.slots.push(slot);
    this.append(slot);
  }
};

ui.SkillPanel.prototype = Object.create(ui.Widget.prototype);

// Constructors
ui.SkillPanel.Create = function() {
  return $('<div class="skill-panel" />');
};

ui.skillpanel = ui.widgetConstructor('skill-panel', ui.SkillPanel);
