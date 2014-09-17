'use strict';

function _GameObjectManager() {
  EventEmitter.call(this);

  this.objects = [];
}
_GameObjectManager.prototype = new EventEmitter();

_GameObjectManager.prototype.addObject = function(obj) {
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

_GameObjectManager.prototype.update = function(delta) {
  for (var i = 0; i < this.objects.length; ++i) {
    this.objects[i].update(delta);
  }
};

var GOM = new _GameObjectManager();
