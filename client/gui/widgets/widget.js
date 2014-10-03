'use strict';

ui.Widget = function(parent, element) {
  EventEmitter.call(this);

  this._element = element;

  if (parent === this) {
    this._parent = null;
  } else {
    this._parent = parent;
  }

  if (parent instanceof ui.Dialog) {
    this._dialog = parent;
  } else if (parent instanceof ui.Widget) {
    this._dialog = parent._dialog;
  } else {
    throw new Error('Widget parent must be an instanceof ui.Dialog or ui.Widget');
  }
};

ui.Widget.prototype = Object.create(EventEmitter.prototype);

ui.Widget.prototype.show = function() {
  this._element.show();
};

ui.Widget.prototype.toggle = function() {
  this._element.toggle();
};

ui.Widget.prototype.hide = function() {
  this._element.hide();
};

ui.Widget.prototype.getDialog = function() {
  if (this._element.hasClass('.dialog')) {
    return this._element;
  } else {
    return this._element.parents('.dialog');
  }
};
