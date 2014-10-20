var MapManager = require('../maps/mapmanager');
var GameObjectManager = require('./gameobjectmanager');

function _ZoneManager() {
  this.map = null;
  this.objects = null;
  this.centerObj = null;
  this.pawns = [];
  this.colObjects = [];
  this.inScene = false;
}

_ZoneManager.prototype.prepare = function(mapIdx, startPos, callback) {
  this.map = new MapManager();
  this.objects = new GameObjectManager();
  this.pawns = [];
  this.colObjects = [];

  this.map.setMap(mapIdx, function() {
    this.map.setViewerInfo(startPos, function() {
      // TODO: Figure out why this is needed, maybe remove it...
      this.map.rootObj.updateMatrixWorld();

      if (callback) {
        callback();
      }
    }.bind(this));
  }.bind(this));
};

_ZoneManager.prototype.setCenterObject = function(object) {
  this.centerObj = object;
};

_ZoneManager.prototype.addToScene = function() {
  this.inScene = true;
  this.map.addToScene();
  for (var i = 0; i < this.pawns.length; ++i) {
    scene.add(this.pawns[i].rootObj);
  }
};

_ZoneManager.prototype.removeFromScene = function() {
  this.inScene = false;
  this.map.removeFromScene();
  for (var i = 0; i < this.pawns.length; ++i) {
    scene.remove(this.pawns[i].rootObj);
  }
};

_ZoneManager.prototype.addObject = function(obj) {
  if (obj.world && obj.world !== this.map) {
    console.warn('Object added to ZoneManager that is assigned to another zone');
  }

  this.pawns.push(obj.pawn);
  this.colObjects.push(obj.pawn.boundingBoxObj);
  if (this.inScene) {
    scene.add(obj.pawn.rootObj);
  }

  this.objects.addObject(obj);

  obj.world = this.map;
  obj.dropFromSky();
};

_ZoneManager.prototype.removeObject = function(obj) {
  if (!(obj instanceof ProxyObject)) {
    var colObjIdx = this.colObjects.indexOf(obj.pawn.rootObj);
    var pawnIdx = this.pawns.indexOf(obj.pawn);

    if (colObjIdx !== -1) {
      this.colObjects.splice(colObjIdx, 1);
    }

    if (pawnIdx !== -1) {
      this.pawns.splice(pawnIdx, 1);
    }

    if (this.inScene) {
      scene.remove(obj.pawn.rootObj);
    }
  }

  this.objects.removeObject(obj);
};

_ZoneManager.prototype.findByServerObjectIdx = function(objectIdx) {
  return this.objects.findByServerObjectIdx(objectIdx);
};

_ZoneManager.prototype.getRefByServerObjectIdx = function(objectIdx, objectPos) {
  return this.objects.getRefByServerObjectIdx(objectIdx, objectPos);
};

_ZoneManager.prototype.update = function(delta) {
  if (this.objects) {
    this.objects.update(delta);
  }

  if (this.map) {
    if (this.centerObj) {
      this.map.setViewerInfo(this.centerObj.position);
    }
    this.map.update(delta);
  }
};

_ZoneManager.prototype._meshToObject = function(mesh) {
  var parent = mesh;

  do {
    var pawn = parent.userData.owner;

    if (pawn) {
      return pawn.owner;
    }

    parent = parent.parent;
  } while (parent);

  return null;
};

_ZoneManager.prototype._rayPickObjects = function(rayCaster) {
  var inters = rayCaster.intersectObjects(this.colObjects, true);
  if (inters.length > 0) {
    return inters[0];
  }
  return null;
};

_ZoneManager.prototype.objectRayPick = function(rayCaster) {
  var objPickInfo = this._rayPickObjects(rayCaster);
  if (objPickInfo) {
    return this._meshToObject(objPickInfo.object);
  }
  return null;
};

_ZoneManager.prototype.rayPick = function(rayCaster) {
  var objPickInfo = this._rayPickObjects(rayCaster);
  var mapPickInfo = this.map.rayPick(rayCaster);
  if (mapPickInfo && objPickInfo) {
    if (mapPickInfo.distance < objPickInfo.distance) {
      // If the world is closer, remove the object pick
      objPickInfo = null;
    } else {
      // Otherwise, remove the world pick
      mapPickInfo = null;
    }
  }

  if (objPickInfo) {
    return {
      object: this._meshToObject(objPickInfo.object),
      point: objPickInfo.point
    };
  } else if (mapPickInfo) {
    return {
      object: null,
      point: mapPickInfo.point
    };
  } else {
    return null;
  }
};

var GZM = new _ZoneManager();
module.exports = GZM;
