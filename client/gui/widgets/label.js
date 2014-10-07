'use strict';

ui.Label = function(element) {
  ui.Widget.call(this, element);
};

ui.Label.prototype = Object.create(ui.Widget.prototype);

ui.Label.prototype.clear = function() {
  this.html('');
};

ui.Label.prototype.text = function(text) {
  if (text === undefined) {
    return this._element.text();
  } else {
    this._element.text(text);
  }
};

ui.Label.prototype.html = function(html) {
  if (html === undefined) {
    return this._element.html();
  } else {
    this._element.html(html);
  }
};

ui.Label.prototype.prepend = function(html) {
  this._element.prepend(html);
};

ui.Label.prototype.append = function(html) {
  this._element.append(html);
};

ui.Label.prototype.scrollToBottom = function() {
  this._element.prop('scrollTop', this._element.prop('scrollHeight'));
};

// Constructors
ui.Label.Create = function() {
  return $('<div class="label" />');
};

ui.label = ui.widgetConstructor('label', ui.Label);
