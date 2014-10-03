'use strict';

ui.Titlebar = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._element.mousedown(this._onMouseDown.bind(this));
};

ui.Titlebar.prototype = Object.create(ui.Widget.prototype);

ui.Titlebar.prototype._onMouseDown = function(downEvent) {
  var self = this;
  var offset = self._dialog._element.offset();
  ui.bringToTop(self._dialog);

  if (this._element.hasClass('nodrag')) {
    return;
  }

  this._element.css('cursor', 'move');

  function mouseMove(moveEvent) {
    self._dialog._element.offset({
      left: moveEvent.pageX - downEvent.pageX + offset.left,
      top: moveEvent.pageY - downEvent.pageY + offset.top
    });
  }

  function mouseUp() {
    self._element.css('cursor', 'default');
    $(document).off('mousemove', mouseMove);
    $(document).off('mouseup', mouseUp);
  }

  $(document).on('mousemove', mouseMove);
  $(document).on('mouseup', mouseUp);
};

ui.Titlebar.prototype.setDragEnabled = function(enabled) {
  this._element.removeClass('nodrag');

  if (enabled) {
    this._element.addClass('nodrag');
  }
};

ui.titlebar = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.Titlebar(parent, element);
};
