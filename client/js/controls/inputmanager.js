'use strict';

function _InputManager() {
  EventEmitter.call(this);

  var self = this;
  function addCapture(name, outname) {
    if (!outname) {
      outname = name;
    }

    $(function() {
      renderer.domElement.addEventListener(name, function(e) {
        self._handleEvent(name, e);
      }, false );
    });

  }

  addCapture('mousedown');
  addCapture('mouseup');
  addCapture('mousemove');
  addCapture('keydown');
  addCapture('keyup');
  addCapture('touchstart');
  addCapture('touchend');
  addCapture('touchmove');
  addCapture('mousewheel');
  addCapture('DOMMouseScroll', 'mousewheel');

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
}
_InputManager.prototype = new EventEmitter();

_InputManager.prototype._handleEvent = function(name, e) {
  this.emit(name, e);
};

var InputManager = new _InputManager();
