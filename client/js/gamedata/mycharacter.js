'use strict';

function MyCharacter() {
  this.avatar = new Avatar();
  this.avatar.rootObj.name = 'LocalPlayer';
  this.name = '';
  this.level = 0;
}

/**
 * @name MC
 * @type {null}
 */
var MC = null;
