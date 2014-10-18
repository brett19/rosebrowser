'use strict';

function _InputManager() {
  EventEmitter.call(this);

  var self = this;
  function addElCapture(name, outname) {
    if (!outname) {
      outname = name;
    }
    $(function() {
      renderer.domElement.addEventListener(name, function(e) {
        self._handleEvent(outname, e);
      }, false );
    });
  }
  function addCapture(name, outname) {
    if (!outname) {
      outname = name;
    }
    document.addEventListener(name, function(e) {
      self._handleEvent(outname, e);
    }, false );
  }

  addElCapture('mousedown');
  addCapture('mouseup');
  addCapture('mousemove');
  addCapture('keydown');
  addCapture('keyup');
  addElCapture('touchstart');
  addElCapture('touchend');
  addElCapture('touchmove');
  addElCapture('mousewheel');
  addElCapture('DOMMouseScroll', 'mousewheel');

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
}
_InputManager.prototype = new EventEmitter();

_InputManager.prototype._handleEvent = function(name, e) {
  this.emit(name, e);
};

var InputManager = new _InputManager();
module.exports = InputManager;
