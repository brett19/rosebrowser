'use strict';

ui.ProgressBar = function(element) {
  ui.Widget.call(this, element);

  this._bar = $('<div class="bar"></div>');
  this._bar.prependTo(this._element);

  if (this._element.hasClass('percent')) {
    this._percent = ui.label('.label.percent');
    this.append(this._percent);
  }

  if (this._element.hasClass('absolute')) {
    this._absolute = ui.label('.label.absolute');
    this.append(this._absolute);
  }

  this._min = 0;
  this._max = 100;
  this._value = 50;
  this._update();
};

ui.ProgressBar.prototype = Object.create(ui.Widget.prototype);

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

  if (this._percent) {
    this._percent.text(Math.floor(percent) + '%');
  }

  if (this._absolute) {
    this._absolute.text(this._value + ' / ' + this._max);
  }
};

ui.progressbar = ui.widgetConstructor('progressbar', ui.ProgressBar);
