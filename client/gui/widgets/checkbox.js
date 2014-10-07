'use strict';

ui.Checkbox = function(element) {
  ui.Widget.call(this, element);
  this._element.click(this._onClick.bind(this));
};

ui.Checkbox.prototype = Object.create(ui.Widget.prototype);

ui.Checkbox.prototype.checked = function(value) {
  if (value === undefined) {
    return this._element.hasClass('checked');
  } else if (value !== this.checked()) {
    this._element.toggleClass('checked');
  }
};

ui.Checkbox.prototype.click = function() {
  this._element.click();
};

ui.Checkbox.prototype._onClick = function() {
  this.checked(!this.checked());
};

// Constructors
ui.Checkbox.Create = function() {
  return $('<div class="checkbox" />');
};

ui.checkbox = ui.widgetConstructor('checkbox', ui.Checkbox);
