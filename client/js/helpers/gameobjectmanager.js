'use strict';

/**
 * @constructor
 */
function _GameObjectManager() {
  EventEmitter.call(this);

  this.objects = [];
}
_GameObjectManager.prototype = new EventEmitter();

_GameObjectManager.prototype.addObject = function(obj) {
  if (obj.serverObjectIdx <= 0) {
    console.warn('Attempted to add object with invalid server index.');
    return;
  }

  for (var i = 0; i < this.objects.length; ++i) {
    if (this.objects[i] === obj) {
      console.warn('Attempted to add same object twice.');
      return;
    }
    if (this.objects[i].serverObjectIdx === obj.serverObjectIdx) {
      console.warn('Attempted to add object with duplicate server index.');
      return;
    }
  }

  this.objects.push(obj);

  this.emit('object_added', obj);
};

_GameObjectManager.prototype.removeObject = function(obj) {
  var objIdx = this.objects.indexOf(obj);
  if (objIdx !== -1) {
    this.objects.splice(objIdx, 1);
  }

  this.emit('object_removed', obj);
};

_GameObjectManager.prototype.findByServerObjectIdx = function(objectIdx) {
  for (var i = 0;  i < this.objects.length; ++i) {
    var thisObject = this.objects[i];
    if (thisObject.serverObjectIdx === objectIdx) {
      return thisObject;
    }
  }
  return null;
};

_GameObjectManager.prototype.update = function(delta) {
  for (var i = 0; i < this.objects.length; ++i) {
    this.objects[i].update(delta);
  }
};

/**
 * @global
 * @type {_GameObjectManager}
 */
var GOM = new _GameObjectManager();
