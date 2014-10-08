'use strict';

ui.Titlebar = function(element) {
  ui.Widget.call(this, element);
  this._dialog = this.parent('dialog');
  this._element.mousedown(this._onMouseDown.bind(this));

  if (this._element.hasClass('close')) {
    this._closeButton = ui.button('.close');
    this._closeButton.text('X');
    this._closeButton.on('clicked', this._dialog.hide.bind(this._dialog));
    this._closeButton._element.insertAfter(this._element);
  }
};

ui.Titlebar.prototype = Object.create(ui.Widget.prototype);

ui.Titlebar.prototype.dragEnabled = function(enabled) {
  if (enabled === undefined) {
    return this._element.hasClass('drag');
  } else if (enabled !== this.dragEnabled()) {
    this._element.toggleClass('drag');
  }
};

ui.Titlebar.prototype._onMouseDown = function(downEvent) {
  var self = this;
  var offset = this._dialog._element.offset();
  ui.bringToTop(this._dialog);

  if (!this.dragEnabled()) {
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

// Constructors
ui.Titlebar.Create = function() {
  return $('<div class="titlebar" />');
};

ui.titlebar = ui.widgetConstructor('titlebar', ui.Titlebar);
