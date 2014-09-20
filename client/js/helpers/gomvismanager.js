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

GOMVisManager.prototype.findByObject = function(obj) {
  for (var i = 0; i < this.visObjects.length; ++i) {
    if (this.visObjects[i].owner === obj) {
      return this.visObjects[i];
    }
  }
  return null;
};

GOMVisManager.prototype._addObjectMovable = function(obj) {
  var visObj = null;
  if (obj instanceof CharObject) {
    visObj = new CharPawn(obj);
  } else if (obj instanceof NpcObject) {
    visObj = new NpcPawn(obj);
  } else {
    return null;
  }

  return visObj;
};

GOMVisManager.prototype._addObjectItem = function(obj) {
  // TODO: Implement this
  throw new Error('Not Yet Supported');
};

GOMVisManager.prototype._addObject = function(obj) {
  console.log('GOMVis::_addObject', obj);

  var visObj = null;
  if (obj instanceof MoveableObject) {
    visObj = this._addObjectMovable(obj);
  } else if (obj instanceof ItemObject) {
    visObj = this._addObjectItem(obj);
  }

  if (visObj) {
    var highZ = this.world.findHighPoint(obj.position.x, obj.position.y);
    visObj.rootObj.position.copy(obj.position);
    visObj.rootObj.position.z = highZ;

    scene.add(visObj.rootObj);
    this.visObjects.push(visObj);
  } else {
    console.warn('Object added to GOMVis is not a recognized GameObject.');
    return null;
  }

  return visObj;
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

GOMVisManager.prototype.update = function(delta) {
  for (var i = 0; i < this.visObjects.length; ++i) {
    this.visObjects[i].update(delta);
  }
};

GOMVisManager.prototype.removeFromScene = function() {
  throw new Error('Not Yet Implemented');
};
