var MobObject = require('./mobobject');

/**
 * @constructor
 */
function NpcObject(world) {
  MobObject.call(this, world);
  this.type = 'npc';
  this.eventVar = {};
}
NpcObject.prototype = Object.create( MobObject.prototype );

NpcObject.prototype.setEventVar = function(id, value) {
  this.eventVar[id] = value;
};

module.exports = NpcObject;
