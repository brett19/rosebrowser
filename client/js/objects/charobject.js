'use strict';

function CharObject(world) {
  MoveableObject.call(this, 'char', world);

  this.name = '';
  this.level = 0;
  this.gender = 0;
  this.visParts = null;
}
CharObject.prototype = new MoveableObject();
