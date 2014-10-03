ui.CharacterStatusDialog = function(template, character) {
  ui.Dialog.call(this, template);

  this.name = ui.label(this, '.label.name');
  this.hp = ui.progressbar(this, '.progressbar.health');
  this.mp = ui.progressbar(this, '.progressbar.mana');
  this.xp = ui.progressbar(this, '.progressbar.exp');

  if (character) {
    this.setCharacter(character);
  }
}

ui.CharacterStatusDialog.prototype = Object.create(ui.Dialog.prototype);
ui.CharacterStatusDialog.prototype._character = null;

ui.CharacterStatusDialog.prototype.setCharacter = function(character) {
  this._character = character;
  this._update();
};

ui.CharacterStatusDialog.prototype._update = function() {
  this.name.text(this._character.name);

  this.hp.max(this._character.stats.getMaxHp());
  this.hp.value(this._character.hp);

  this.mp.max(this._character.stats.getMaxMp());
  this.mp.value(this._character.mp);

  this.xp.max(1000); // TODO: Real max xp
  this.xp.value(this._character.xp);
};

ui.characterStatusDialog = function(character) {
  return new ui.CharacterStatusDialog('#dlgCharacterStatus', character);
};
