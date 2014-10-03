'use strict';

ui.Textbox = function(parent, element) {
  ui.Widget.call(this, parent, element);
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

ui.textbox = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.Textbox(parent, element);
};
