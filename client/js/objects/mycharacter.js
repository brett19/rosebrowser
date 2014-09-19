'use strict';

function MyCharacter(world) {
  CharObject.call(this, world);
  this.type = 'local';
}
MyCharacter.prototype = new CharObject();

/**
 * @name MC
 * @type {MyCharacter}
 */
var MC = null;
