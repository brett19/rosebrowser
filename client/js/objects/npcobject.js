'use strict';

function NpcObject() {
  GameObject.call(this, 'npc');

  this.charIdx = 0;
  this.direction = 0;
}
NpcObject.prototype = new GameObject();

NpcObject.prototype.setDirection = function(angle) {
  this.direction = angle;
};
