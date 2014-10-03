'use strict';

ui.Checkbox = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._element.click(this._onClick.bind(this));
};

ui.Checkbox.prototype = Object.create(ui.Widget.prototype);

ui.Checkbox.prototype._onClick = function() {
  this.checked(!this.checked());
};

ui.Checkbox.prototype.checked = function(value) {
  if (value === undefined) {
    return this._element.hasClass('checked');
  } else if (value !== this.checked()) {
    this._element.toggleClass('checked');
  }
};

ui.checkbox = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.Checkbox(parent, element);
};
