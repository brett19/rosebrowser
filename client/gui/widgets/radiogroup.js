'use strict';

ui.RadioGroup = function(element) {
  ui.Widget.call(this, element);
  this._buttons = [];
  this._index = 0;
  this._update();
};

ui.RadioGroup.prototype = Object.create(ui.Widget.prototype);

ui.RadioGroup.prototype._update = function() {
  var buttons = this._element.children('.button');

  this._buttons = [];

  for (var i = 0; i < buttons.length; ++i) {
    var button = ui.button($(buttons[i]));
    button.on('clicked', this._onItemClicked.bind(this, i));
    this._buttons.push(button);
  }

  if (this._buttons.length) {
    this._buttons[0].click();
  }
};

ui.RadioGroup.prototype._onItemClicked = function(index) {
  this.index(index, true);
  this.emit('itemclicked', index);
};

ui.RadioGroup.prototype.index = function(index, noClick) {
  if (index === undefined) {
    return this._index;
  } else {
    for (var i = 0; i < this._buttons.length; ++i) {
      this._buttons[i].active(i === index);
    }

    this._index = index;

    if (!noClick) {
      this._buttons[index].click();
    }
  }
};

// Constructors
ui.RadioGroup.Create = function() {
  return $('<div class="radiogroup" />');
};

ui.radiogroup = ui.widgetConstructor('radiogroup', ui.RadioGroup);
