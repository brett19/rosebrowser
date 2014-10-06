'use strict'

ui.CharacterDialog = function(template, mycharacter) {
  ui.Dialog.call(this, template);

  this._level = ui.label(this, '.label.level');
  this._job = ui.label(this, '.label.job');
  this._clan = ui.label(this, '.label.clan');

  this._str = ui.label(this, '.label.str');
  this._dex = ui.label(this, '.label.dex');
  this._int = ui.label(this, '.label.int');
  this._con = ui.label(this, '.label.con');
  this._cha = ui.label(this, '.label.cha');
  this._sen = ui.label(this, '.label.sen');
  this._strSp = ui.label(this, '.label.str-sp');
  this._dexSp = ui.label(this, '.label.dex-sp');
  this._intSp = ui.label(this, '.label.int-sp');
  this._conSp = ui.label(this, '.label.con-sp');
  this._chaSp = ui.label(this, '.label.cha-sp');
  this._senSp = ui.label(this, '.label.sen-sp');

  this._attack = ui.label(this, '.label.attack');
  this._accuracy = ui.label(this, '.label.accuracy');
  this._critical = ui.label(this, '.label.critical');
  this._criticalDamage = ui.label(this, '.label.critical-damage');
  this._piercePhysical = ui.label(this, '.label.pierce-physical');
  this._pierceMagical = ui.label(this, '.label.pierce-magical');
  this._attackSpeed = ui.label(this, '.label.attack-speed');
  this._pvmOffense = ui.label(this, '.label.pvm-offense');
  this._pvpOffense = ui.label(this, '.label.pvp-offense');
  this._mpCost = ui.label(this, '.label.mp-cost');
  this._summonGauge = ui.label(this, '.label.summon-gauge');

  this._defense = ui.label(this, '.label.attack');
  this._magicDefense = ui.label(this, '.label.magic-defense');
  this._dodge = ui.label(this, '.label.dodge');
  this._blockRate = ui.label(this, '.label.block-rate');
  this._blockPhysical = ui.label(this, '.label.block-physical');
  this._blockMagical = ui.label(this, '.label.block-magical');
  this._runSpeed = ui.label(this, '.label.run-speed');
  this._pvmDefense = ui.label(this, '.label.pvm-defense');
  this._pvpDefense = ui.label(this, '.label.pvp-defense');
  this._hpRecovery = ui.label(this, '.label.hp-recovery');
  this._mpRecovery = ui.label(this, '.label.mp-recovery');

  this._data = mycharacter;
  this._data.on('changed', this._update.bind(this));
  this._update();
};

ui.CharacterDialog.prototype = Object.create(ui.Dialog.prototype);

function _makePerc(val, max) {
  return (val / max * 100).toFixed(2) + '%'
}

ui.CharacterDialog.prototype._update = function() {
  var char = this._data;
  var stats = char.stats;

  this._level.text(char.level);
  this._job.text(char.job);

  this._str.text(stats.str);
  this._dex.text(stats.dex);
  this._int.text(stats.int);
  this._con.text(stats.con);
  this._cha.text(stats.cha);
  this._sen.text(stats.sen);

  this._attack.text(0);
  this._accuracy.text(0);
  this._critical.text(_makePerc(stats.getCritical(), 250));
};

ui.characterDialog = function(inventory) {
  return new ui.CharacterDialog('#dlgCharacter', inventory);
};
