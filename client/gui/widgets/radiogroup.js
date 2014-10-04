'use strict';

ui.RadioGroup = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._update();
};

ui.RadioGroup.prototype = Object.create(ui.Widget.prototype);
ui.RadioGroup.prototype._buttons = [];
ui.RadioGroup.prototype._index = 0;

ui.RadioGroup.prototype._update = function() {
  var buttons = this._element.children('.button');

  this._buttons = [];

  for (var i = 0; i < buttons.length; ++i) {
    var button = ui.button(this, $(buttons[i]));
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
      this._buttons[i]._element.removeClass('active');
    }

    this._index = index;
    this._buttons[index]._element.addClass('active');

    if (!noClick) {
      this._buttons[index].click();
    }
  }
};

ui.radiogroup = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.RadioGroup(parent, element);
};
