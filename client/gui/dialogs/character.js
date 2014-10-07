'use strict';
ui.loadTemplateFile('character.html');

ui.CharacterDialog = function(mycharacter) {
  ui.Dialog.call(this, 'character.html');

  // Char Info
  this._level = ui.charstat(this, '.stat.level');
  this._job   = ui.charstat(this, '.stat.job');
  this._clan  = ui.charstat(this, '.stat.clan');

  // Bars
  this._hp    = ui.charstat(this, '.stat.health');
  this._mp    = ui.charstat(this, '.stat.mana');
  this._xp    = ui.charstat(this, '.stat.exp');

  // Column 1
  this._strength        = ui.charstat(this, '.stat.strength');
  this._dexterity       = ui.charstat(this, '.stat.dexterity');
  this._intelligence    = ui.charstat(this, '.stat.intelligence');
  this._concentration   = ui.charstat(this, '.stat.concentration');
  this._charm           = ui.charstat(this, '.stat.charm');
  this._sense           = ui.charstat(this, '.stat.sense');

  // Colum 2
  this._attack          = ui.charstat(this, '.stat.attack');
  this._accuracy        = ui.charstat(this, '.stat.accuracy');
  this._critical        = ui.charstat(this, '.stat.critical');
  this._criticalDamage  = ui.charstat(this, '.stat.critical-damage');
  this._piercePhysical  = ui.charstat(this, '.stat.pierce-physical');
  this._pierceMagical   = ui.charstat(this, '.stat.pierce-magical');
  this._attackSpeed     = ui.charstat(this, '.stat.attack-speed');
  this._pvmOffense      = ui.charstat(this, '.stat.pvm-offense');
  this._pvpOffense      = ui.charstat(this, '.stat.pvp-offense');
  this._mpCost          = ui.charstat(this, '.stat.mp-cost');
  this._summonGauge     = ui.charstat(this, '.stat.summon-gauge');

  // Column 3
  this._defense         = ui.charstat(this, '.stat.attack');
  this._magicDefense    = ui.charstat(this, '.stat.magic-defense');
  this._dodge           = ui.charstat(this, '.stat.dodge');
  this._blockRate       = ui.charstat(this, '.stat.block-rate');
  this._blockPhysical   = ui.charstat(this, '.stat.block-physical');
  this._blockMagical    = ui.charstat(this, '.stat.block-magical');
  this._runSpeed        = ui.charstat(this, '.stat.run-speed');
  this._pvmDefense      = ui.charstat(this, '.stat.pvm-defense');
  this._pvpDefense      = ui.charstat(this, '.stat.pvp-defense');
  this._hpRecovery      = ui.charstat(this, '.stat.hp-recovery');
  this._mpRecovery      = ui.charstat(this, '.stat.mp-recovery');

  // Set units
  this._critical.unit('%');
  this._criticalDamage.unit('%');
  this._attackSpeed.unit('%');
  this._pvmOffense.unit('%');
  this._pvpOffense.unit('%');
  this._blockRate.unit('%');
  this._pvmDefense.unit('%');
  this._pvpDefense.unit('%');
  this._hpRecovery.unit(' / Sec');
  this._mpRecovery.unit(' / Sec');

  this._data = mycharacter;
  this._data.on('changed', this._update.bind(this));
  this._update();
};

ui.CharacterDialog.prototype = Object.create(ui.Dialog.prototype);

function _makePerc(val, max) {
  return (val / max * 100).toFixed(2);
}

ui.CharacterDialog.prototype._update = function() {
  var char = this._data;
  var stats = char.stats;

  this._level.value(char.level);
  this._job.value(char.job);

  this._hp.max(stats.getMaxHp());
  this._hp.value(char.hp);
  this._mp.max(stats.getMaxMp());
  this._mp.value(char.mp);
  this._xp.max(stats.getNeedRawExp());
  this._xp.value(char.xp);

  this._strength.value(stats.str);
  this._dexterity.value(stats.dex);
  this._intelligence.value(stats.int);
  this._concentration.value(stats.con);
  this._charm.value(stats.cha);
  this._sense.value(stats.sen);

  this._attack.value(0);
  this._accuracy.value(0);
  this._critical.value(_makePerc(stats.getCritical(), 250));
};

// Helper widget for stats
ui.CharacterStat = function(element) {
  ui.Widget.call(this, element);

  this._value = ui.label(this, '.label.value');
  this._bar = ui.progressbar(this, '.progressbar.value');
  this._units = '';

  this._cost = ui.label(this, '.label.cost');
  this._levelup = ui.button(this, '.button.levelup');

  if (this._cost) {
    this._cost.hide();
  }

  if (this._levelup) {
    this._levelup.hide();
  }
};

ui.CharacterStat.prototype = Object.create(ui.Widget.prototype);

ui.CharacterStat.prototype.unit = function(unit) {
  if (unit === undefined) {
    return this._units;
  } else {
    this._units = unit;
  }
};

ui.CharacterStat.prototype.value = function(value) {
  if (value === undefined) {
    if (this._value) {
      return this._value.text().replace(this._units, '');
    } else if (this._bar) {
      return this._bar.value();
    }
  } else if (this._value) {
    this._value.text(value + this._units);
  } else if (this._bar) {
    this._bar.value(value);
  }
};

ui.CharacterStat.prototype.min = function(min) {
  if (this._bar) {
    return this._bar.min(min);
  }
};

ui.CharacterStat.prototype.max = function(max) {
  if (this._bar) {
    return this._bar.max(max);
  }
};

ui.charstat = ui.widgetConstructor('stat', ui.CharacterStat);

ui.characterDialog = function(inventory) {
  return new ui.CharacterDialog(inventory);
};
