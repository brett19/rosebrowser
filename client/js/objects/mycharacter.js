'use strict';

function MyCharacter(world) {
  CharObject.call(this, world);
  this.type = 'local';
  this.useMoveCollision = true;
}
MyCharacter.prototype = new CharObject();

/**
 * @name MC
 * @type {MyCharacter}
 */
var MC = null;
