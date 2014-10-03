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

  // TODO: real hp values
  this.hp.min(0);
  this.hp.max(this._character.stats.getMaxHp());
  this.hp.value(this._character.hp);

  // TODO real mp values
  this.mp.min(0);
  this.mp.max(this._character.stats.getMaxMp());
  this.mp.value(this._character.mp);

  // TODO real xp values
  this.xp.min(0);
  this.xp.max(100);
  this.xp.value(10);
};

ui.characterStatusDialog = function(character) {
  return new ui.CharacterStatusDialog('#dlgCharacterStatus', character);
};
