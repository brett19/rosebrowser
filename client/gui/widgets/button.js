'use strict';

ui.Button = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._element.click(this._onClicked.bind(this));
};

ui.Button.prototype = Object.create(ui.Widget.prototype);

ui.Button.prototype.click = function() {
  this._onClicked();
};

ui.Button.prototype._onClicked = function() {
  this.emit('clicked');
};

ui.button = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.Button(parent, element);
};
