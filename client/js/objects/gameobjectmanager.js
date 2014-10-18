var EventEmitter = require('../util/eventemitter');

/**
 * @constructor
 */
function GameObjectManager() {
  EventEmitter.call(this);

  this.objects = [];
}
GameObjectManager.prototype = new EventEmitter();

GameObjectManager.prototype.addObject = function(obj) {
  if (obj.serverObjectIdx <= 0) {
    console.warn('Attempted to add object with invalid server index.');
    return;
  }

  var foundProxyIdx = -1;
  for (var i = 0; i < this.objects.length; ++i) {
    if (this.objects[i] === obj) {
      console.warn('Attempted to add same object twice.');
      return;
    }
    if (this.objects[i].serverObjectIdx === obj.serverObjectIdx) {
      if (this.objects[i] instanceof ProxyObject) {
        foundProxyIdx = i;
        break;
      }

      console.warn('Attempted to add object with duplicate server index.');
      return;
    }
  }

  if (foundProxyIdx === -1) {
    this.objects.push(obj);
  } else {
    obj.ref = this.objects[foundProxyIdx].ref;
    obj.ref._object = obj;
    this.objects[foundProxyIdx] = obj;
  }

  this.emit('object_added', obj);
};

GameObjectManager.prototype.removeObject = function(obj) {
  var objIdx = this.objects.indexOf(obj);
  if (objIdx !== -1) {
    var proxyObj = new ProxyObject();
    proxyObj.serverObjectIdx = obj.serverObjectIdx;
    proxyObj.setPosition(obj.position.x, obj.position.y, obj.position.z);
    proxyObj.ref = obj.ref;
    proxyObj.ref._object = proxyObj;
    this.objects[objIdx] = proxyObj;
  }

  this.emit('object_removed', obj);
};

GameObjectManager.prototype.findByServerObjectIdx = function(objectIdx) {
  for (var i = 0;  i < this.objects.length; ++i) {
    var thisObject = this.objects[i];
    if (thisObject.serverObjectIdx === objectIdx) {
      return thisObject;
    }
  }
  return null;
};

GameObjectManager.prototype.getRefByServerObjectIdx = function(objectIdx, objectPos) {
  var foundObj = this.findByServerObjectIdx(objectIdx);

  if (!foundObj) {
    foundObj = new ProxyObject();
    foundObj.serverObjectIdx = objectIdx;
    this.addObject(foundObj);
  }

  if (foundObj instanceof ProxyObject) {
    foundObj.setPosition(objectPos.x, objectPos.y, objectPos.z);
  }

  return foundObj.ref;
};

GameObjectManager.prototype.update = function(delta) {
  for (var i = 0; i < this.objects.length; ++i) {
    this.objects[i].update(delta);
  }
};

module.exports = GameObjectManager;
