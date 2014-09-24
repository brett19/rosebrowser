'use strict';

function CharObject(world) {
  MoveableObject.call(this, 'char', world);

  this.name = '';
  this.level = 0;
  this.job = 0;
  this.gender = 0;
  this.hairColor = 0;
  this.hp = 0;
  this.visParts = null;
}
CharObject.prototype = new MoveableObject();

CharObject.prototype.getAbilityValue = function(abilType) {
  switch(abilType) {
    case ABILTYPE.SEX: return this.gender;
    case ABILTYPE.CLASS: return this.job;
    case ABILTYPE.LEVEL: return this.level;
    case ABILTYPE.HAIRCOLOR: return this.hairColor;
    case ABILTYPE.HP: return this.hp;
  }

  console.warn('Attempted to retrieve unknown ability value:', abilType);
  return 0;
};

CharObject.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['name'],
    ['level', 0, 255],
    ['gender', 0, 1],
    ['hairColor', 0],
    ['hp', 0, 999999],
    ['visParts']
  ]);
};
