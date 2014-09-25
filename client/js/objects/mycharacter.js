'use strict';

/**
 * @constructor
 */
function MyCharacter(world) {
  CharObject.call(this, world);
  this.type = 'local';
  this.useMoveCollision = true;

  this.mp = undefined;
  this.stats = {
    str: undefined,
    dex: undefined,
    int: undefined,
    con: undefined,
    cha: undefined,
    sen: undefined
  };
  this.inventory = undefined;
}
MyCharacter.prototype = new CharObject();

MyCharacter.prototype.getAbilityValue = function(abilType) {
  switch(abilType) {
    case ABILTYPE.STR: return this.stats.str;
    case ABILTYPE.DEX: return this.stats.dex;
    case ABILTYPE.INT: return this.stats.int;
    case ABILTYPE.CON: return this.stats.con;
    case ABILTYPE.CHA: return this.stats.cha;
    case ABILTYPE.SEN: return this.stats.sen;

    case ABILTYPE.MP: return this.mp;
    case ABILTYPE.MONEY: return this.inventory.money;
  }

  return CharObject.prototype.getAbilityValue.call(this, abilType);
};

MyCharacter.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['mp', 0, 999999],
    ['stats.str', 0, 5000],
    ['stats.dex', 0, 5000],
    ['stats.int', 0, 5000],
    ['stats.con', 0, 5000],
    ['stats.cha', 0, 5000],
    ['stats.sen', 0, 5000],
    ['inventory']
  ]);
  CharObject.prototype.debugValidate.call(this);
};

/**
 * @name MC
 * @type {MyCharacter}
 */
var MC = null;
