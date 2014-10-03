'use strict';

/**
 * @constructor
 */
function GOMVisManager(world) {
  this.world = world;
  this.inScene = false;
  this.visObjects = [];
  this.colObjects = [];

  var self = this;
  this.onAddObject = function(obj) {
    self._addObject(obj);
  };
  this.onRemoveObject = function(obj) {
    self._removeObject(obj);
  };
}

GOMVisManager.prototype.rayPick = function(rayCaster) {
  var inters = rayCaster.intersectObjects( this.colObjects, true );
  if (inters.length > 0) {
    return inters[0];
  }
  return null;
};

GOMVisManager.prototype.findByMesh = function(mesh) {
  // Find the root Object3D for whatever we clicked.
  var rootObj = mesh.rootObject;
  if (rootObj) {
    // Find the Pawn associated with this Object3D
    var foundPawn = rootObj.owner;
    if (foundPawn) {
      return foundPawn;
    }
  }
  return null;
};

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
    visObj = obj.pawn;
  } else if (obj instanceof NpcObject) {
    visObj = obj.pawn;
  } else if (obj instanceof MobObject) {
    // TODO: NpcObject should derive NpcObject or vica-versa
    visObj = obj.pawn;
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

  if (obj instanceof ProxyObject) {
    return;
  }

  var visObj = null;
  if (obj instanceof ActorObject) {
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
    this.colObjects.push(visObj.rootObj);
  } else {
    console.warn('Object added to GOMVis is not a recognized GameObject.');
    return null;
  }

  return visObj;
};

GOMVisManager.prototype._removeObject = function(obj) {
  console.log('GOMVis::_removeObject', obj);

  var visObj = this.findByObject(obj);
  if (visObj) {
    scene.remove(visObj.rootObj);

    var objIdx = this.visObjects.indexOf(visObj);
    if (objIdx !== -1) {
      this.visObjects.splice(objIdx, 1);
    }

    var colObjIdx = this.colObjects.indexOf(visObj.rootObj);
    if (colObjIdx !== -1) {
      this.colObjects.splice(colObjIdx, 1);
    }
  }
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
    //this.visObjects[i].update(delta);
  }
};

GOMVisManager.prototype.removeFromScene = function() {
  throw new Error('Not Yet Implemented');
};
