var CharObject = require('./charobject');

/**
 * @constructor
 */
function MyCharacter(world) {
  CharObject.call(this, world);
  this.type = 'local';
  this.useMoveCollision = true;

  this.mp = undefined;
  this.inventory = undefined;
  this.quests = undefined;

  this.on('damage', this.changed.bind(this));
};

MyCharacter.prototype = Object.create( CharObject.prototype );

MyCharacter.prototype.changed = function() {
  this.emit('changed');
};

MyCharacter.prototype.getAbilityValue = function(abilType) {
  switch(abilType) {
    case ABILTYPE.STR: return this.stats.str;
    case ABILTYPE.DEX: return this.stats.dex;
    case ABILTYPE.INT: return this.stats.int;
    case ABILTYPE.CON: return this.stats.con;
    case ABILTYPE.CHA: return this.stats.cha;
    case ABILTYPE.SEN: return this.stats.sen;

    case ABILTYPE.MP: return this.mp;
    case ABILTYPE.EXP: return this.xp;
    case ABILTYPE.MONEY: return this.inventory.money;
    case ABILTYPE.BIRTH: return this.birthStone;
    case ABILTYPE.UNION: return this.union;
    case ABILTYPE.RANK: return this.rank;
    case ABILTYPE.FAME: return this.fame;
  }

  return CharObject.prototype.getAbilityValue.call(this, abilType);
};

MyCharacter.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['mp', 0, 999999],
    ['inventory'],
    ['quests']
  ]);
  CharObject.prototype.debugValidate.call(this);
};

module.exports = MyCharacter;
