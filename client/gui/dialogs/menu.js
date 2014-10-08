'use strict';
ui.loadTemplateFile('menu.html');

ui.MenuDialog = function() {
  ui.Dialog.call(this, 'menu.html');

  ui.button(this, '.button.character').on('clicked', this._onCharacter.bind(this));
  ui.button(this, '.button.inventory').on('clicked', this._onInventory.bind(this));
  ui.button(this, '.button.quest-list').on('clicked', this._onQuestList.bind(this));
  ui.button(this, '.button.skill-list').on('clicked', this._onSkillList.bind(this));
}

ui.MenuDialog.prototype = Object.create(ui.Dialog.prototype);

ui.MenuDialog.prototype._onCharacter = function() {
  this.emit('toggle-character');
};

ui.MenuDialog.prototype._onInventory = function() {
  this.emit('toggle-inventory');
};

ui.MenuDialog.prototype._onQuestList = function() {
  this.emit('toggle-quest-list');
};

ui.MenuDialog.prototype._onSkillList = function() {
  this.emit('toggle-skill-list');
};

ui.menuDialog = function() {
  return new ui.MenuDialog();
};
