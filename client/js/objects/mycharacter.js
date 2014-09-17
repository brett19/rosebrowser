'use strict';

function MyCharacter() {
  GameObject.call(this, 'local');

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
