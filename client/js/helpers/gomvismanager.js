'use strict';

function GOMVisManager(world) {
  this.world = world;
  this.inScene = false;
  this.visObjects = [];

  var self = this;
  this.onAddObject = function(obj) {
    self._addObject(obj);
  };
  this.onRemoveObject = function(obj) {
    self._removeObject(obj);
  };
}

GOMVisManager.prototype._addObject = function(obj) {
  console.log('GOMVis::_addObject', obj);

  var highZ = this.world.findHighPoint(obj.position.x, obj.position.y);

  var visObj = new NpcCharacter();
  visObj.rootObj.name = 'NPC_' + obj.serverObjectIdx + '_' + obj.charIdx;
  visObj.setModel(obj.charIdx);
  visObj.rootObj.position.copy(obj.position);
  visObj.rootObj.position.z = highZ;
  visObj.rootObj.rotation.z = obj.direction / 180 * Math.PI;
  scene.add(visObj.rootObj);

  this.visObjects.push(visObj);
};

GOMVisManager.prototype._removeObject = function(obj) {
  console.log('GOMVis::_removeObject', obj);
};

GOMVisManager.prototype.addToScene = function() {
  this.inScene = true;

  for (var i = 0; i < GOM.objects.length; ++i) {
    this._addObject(GOM.objects[i]);
  }

  GOM.addEventListener('object_added', this.onAddObject);
  GOM.addEventListener('object_removed', this.onRemoveObject);
};

GOMVisManager.prototype.removeFromScene = function() {
  throw new Error('Not Yet Implemented');
};
