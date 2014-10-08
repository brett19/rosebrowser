'use strict';

ui.Button = function(element) {
  ui.Widget.call(this, element);
  this._element.click(this._onClicked.bind(this));

  var text = this._element.text();
  this._text = $('<div class="text">' + text + '</div>');
  this._element.html('');
  this._element.append(this._text);
};

ui.Button.prototype = Object.create(ui.Widget.prototype);

ui.Button.prototype.text = function(text) {
  if (text === undefined) {
    return this._text.text();
  } else {
    this._text.text(text);
  }
};

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

// Constructors
ui.Button.Create = function() {
  return $('<div class="button" />');
};

ui.button = ui.widgetConstructor('button', ui.Button);
