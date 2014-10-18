ui.GameUI = function(character) {
  this.dialogs    = [];
  this.menu       = ui.menuDialog();
  this.chatBox    = ui.chatBox();
  this.charStatus = ui.characterStatusDialog(character);
  this.character  = ui.characterDialog(character);
  this.inventory  = ui.inventoryDialog(character.inventory);
  this.questList  = ui.questListDialog(character.quests);
  this.quickbar   = ui.quickBarDialog(character.hotIcons);
  this.party      = ui.partyDialog(character.party);
  this.skillList  = ui.skillsDialog(character.skills);

  this.character.hide();
  this.inventory.hide();
  this.questList.hide();
  this.skillList.hide();

  this.dialogs.push(this.menu);
  this.dialogs.push(this.chatBox);
  this.dialogs.push(this.charStatus);
  this.dialogs.push(this.inventory);
  this.dialogs.push(this.questList);
  this.dialogs.push(this.quickbar);
  this.dialogs.push(this.party);
  this.dialogs.push(this.skillList);

  this.menu.on('toggle-character', this._toggleCharacterDialog.bind(this));
  this.menu.on('toggle-inventory', this._toggleInventoryDialog.bind(this));
  this.menu.on('toggle-quest-list', this._toggleQuestListDialog.bind(this));
  this.menu.on('toggle-skill-list', this._toggleSkillListDialog.bind(this));
};

ui.GameUI.prototype._toggleCharacterDialog = function() {
  this.character.toggle();
};

ui.GameUI.prototype._toggleInventoryDialog = function() {
  this.inventory.toggle();
};

ui.GameUI.prototype._toggleQuestListDialog = function() {
  this.questList.toggle();
};

ui.GameUI.prototype._toggleSkillListDialog = function() {
  this.skillList.toggle();
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
