'use strict';

ui.Button = function(element) {
  ui.Widget.call(this, element);
  this._element.click(this._onClicked.bind(this));
};

ui.Button.prototype = Object.create(ui.Widget.prototype);

ui.Button.prototype.active = function(active) {
  if (active === undefined) {
    return this._element.hasClass('active');
  } else if (active !== this.active()){
    this._element.toggleClass('active');
  }
};

ui.Button.prototype.click = function() {
  this._onClicked();
};

ui.Button.prototype._onClicked = function() {
  this.emit('clicked');
};

ui.button = ui.widgetConstructor('button', ui.Button);
