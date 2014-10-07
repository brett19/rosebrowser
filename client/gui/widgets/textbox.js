'use strict';

ui.Textbox = function(element) {
  ui.Widget.call(this, element);
  this._element.keypress(this._onKeyDown.bind(this));
};

ui.Textbox.prototype = Object.create(ui.Widget.prototype);

ui.Textbox.prototype._onKeyDown = function(event) {
  if (event.keyCode === ui.KEY_CODES.ENTER) {
    this.emit('returnpressed');
  }
};

ui.Textbox.prototype.text = function(text) {
  if (text === undefined) {
    return this._element.val();
  } else {
    this._element.val(text);
  }
};

// Constructors
ui.Textbox.Create = function() {
  return $('<input type="text" class="textbox" />');
};

ui.textbox = ui.widgetConstructor('textbox', ui.Textbox);
