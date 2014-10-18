var EventEmitter = require('../util/eventemitter');
var GORef = require('./goref');

/**
 * @constructor
 */
function GameObject(objType, world) {
  EventEmitter.call(this);

  this.world = world;
  this.type = objType;
  this.serverObjectIdx = -1;
  this.position = new THREE.Vector3(0, 0, 0);
  this.ref = new GORef(this);
  this.selected = false;
  this.pawn = undefined;
}
GameObject.prototype = new EventEmitter();

GameObject.prototype.setPosition = function(x, y, z) {
  this.position.set(x, y, z);
  this.emit('moved');
};

GameObject.prototype.dropFromSky = function() {
  var highZ = this.world.findHighPoint(this.position.x, this.position.y);
  this.position.z = highZ;
  this.emit('moved');
};

GameObject.prototype.update = function(delta) {
  if (this.pawn) {
    this.pawn.setPosition(this.position);
    this.pawn.update(delta);
  }
};

module.exports = GameObject;
