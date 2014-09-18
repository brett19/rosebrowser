'use strict';

function MyCharacter(world) {
  GameObject.call(this, 'local', world);

  this.avatar = new Avatar();
  this.avatar.rootObj.name = 'LocalPlayer';
  this.name = '';
  this.level = 0;
}
MyCharacter.prototype = new GameObject();

/**
 * @name MC
 * @type {null}
 */
var MC = null;
