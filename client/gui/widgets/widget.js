'use strict';

ui.Widget = function(element) {
  EventEmitter.call(this);

  if (element.length !== 1) {
    throw new Error('Widget wrapping a jQuery object with .length !== 1');
  }

  this._element = element;
  this._element[0].__widget = this;
};

ui.Widget.prototype = Object.create(EventEmitter.prototype);

ui.Widget.prototype.show = function() {
  this._element.show();
};

ui.Widget.prototype.toggle = function() {
  this._element.toggle();
};

ui.Widget.prototype.hide = function() {
  this._element.hide();
};

ui.Widget.prototype.parent = function(className) {
  for (var parent = this._element.parent(); parent.length; parent = parent.parent()) {
    if (parent[0].__widget) {
      if (className) {
        if (parent.hasClass(className)) {
          return parent[0].__widget;
        }
      } else {
        return parent[0].__widget;
      }
    }
  }

  return null;
};

ui.Widget.prototype.append = function(widget) {
  if (widget instanceof ui.Widget) {
    this._element.append(widget._element);
  } else {
    throw new Error('Tried to append non-widget to widget');
  }
};
