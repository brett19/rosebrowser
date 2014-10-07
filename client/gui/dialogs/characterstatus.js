'use strict';
ui.loadTemplateFile('characterstatus.html');

ui.CharacterStatusDialog = function(character) {
  ui.Dialog.call(this, 'characterstatus.html');

  this.name = ui.label(this, '.label.name');
  this.hp = ui.progressbar(this, '.progressbar.health');
  this.mp = ui.progressbar(this, '.progressbar.mana');
  this.xp = ui.progressbar(this, '.progressbar.exp');

  this._data = character;
  this._data.on('changed', this._update.bind(this));
  this._update();
}

ui.CharacterStatusDialog.prototype = Object.create(ui.Dialog.prototype);

ui.CharacterStatusDialog.prototype._update = function() {
  this.name.text(this._data.name);

  this.hp.max(this._data.stats.getMaxHp());
  this.hp.value(this._data.hp);

  this.mp.max(this._data.stats.getMaxMp());
  this.mp.value(this._data.mp);

  this.xp.max(this._data.stats.getNeedRawExp());
  this.xp.value(this._data.xp);
};

ui.characterStatusDialog = function(character) {
  return new ui.CharacterStatusDialog(character);
};
