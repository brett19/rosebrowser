'use strict';

ui.ProgressBar = function(parent, element) {
  ui.Widget.call(this, parent, element);

  this._bar = $('<div class="bar"></div>');
  this._bar.prependTo(this._element);
  this._percent = ui.label(this, '.percent');
  this._absolute = ui.label(this, '.absolute');
  this._update();
};

ui.ProgressBar.prototype = Object.create(ui.Widget.prototype);

ui.ProgressBar.prototype._min = 0;
ui.ProgressBar.prototype._max = 100;
ui.ProgressBar.prototype._value = 50;

ui.ProgressBar.prototype.min = function(min) {
  if (min === undefined) {
    return this._min;
  } else {
    this._min = min;
    this._update();
  }
};

ui.ProgressBar.prototype.max = function(max) {
  if (max === undefined) {
    return this._max;
  } else {
    this._max = max;
    this._update();
  }
};

ui.ProgressBar.prototype.value = function(value) {
  if (value === undefined) {
    return this._value;
  } else {
    this._value = value;
    this._update();
  }
};

ui.ProgressBar.prototype._update = function() {
  var percent = 100 * (this._value - this._min) / (this._max - this._min);
  this._bar.css('width', percent + '%');
  this._percent.text(Math.floor(percent) + '%');
  this._absolute.text(this._value + ' / ' + this._max);
};

ui.progressbar = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.ProgressBar(parent, element);
};
