'use strict';

ui.GameUI = function(character) {
  this.dialogs    = [];
  this.menu       = ui.menuDialog();
  this.chatBox    = ui.chatBox();
  this.charStatus = ui.characterStatusDialog(character);
  this.inventory  = ui.inventoryDialog(character.inventory);
  this.questList  = ui.questListDialog(character.quests);

  this.inventory.hide();
  this.questList.hide();

  this.dialogs.push(this.menu);
  this.dialogs.push(this.chatBox);
  this.dialogs.push(this.charStatus);
  this.dialogs.push(this.inventory);
  this.dialogs.push(this.questList);

  this.menu.on('toggle-inventory', this._toggleInventoryDialog.bind(this));
  this.menu.on('toggle-quest-list', this._toggleQuestListDialog.bind(this));
};

ui.GameUI.prototype._toggleInventoryDialog = function() {
  this.inventory.toggle();
};

ui.GameUI.prototype._toggleQuestListDialog = function() {
  this.questList.toggle();
};

ui.GameUI.prototype.close = function() {
  for (var i = 0; i < this.dialogs.length; ++i) {
    this.dialogs[i].close();
  }

  this.dialogs = [];
};

ui.gameUI = function(character) {
  return new ui.GameUI(character);
};
