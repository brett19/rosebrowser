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
  this.hp.max(9999);
  this.hp.value(1337);

  // TODO real mp values
  this.mp.min(0);
  this.mp.max(100);
  this.mp.value(50);

  // TODO real xp values
  this.mp.min(0);
  this.mp.max(100);
  this.mp.value(10);
};

ui.characterStatusDialog = function(character) {
  return new ui.CharacterStatusDialog('#dlgCharacterStatus', character);
};
