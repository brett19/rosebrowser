'use strict';

ui.Dialog = function(template) {
  ui.Widget.call(this, ui.loadFromTemplate(template));
  ui.addDialog(this);

  this._titleBar = ui.titlebar(this, '.titlebar');
};

ui.Dialog.prototype = Object.create(ui.Widget.prototype);

ui.Dialog.prototype.center = function() {
  this.centerX();
  this.centerY();
};

ui.Dialog.prototype.alignLeftEdge = function(padding) {
  this._element.css('left', padding + 'px');
};

ui.Dialog.prototype.alignTopEdge = function(padding) {
  this._element.css('top', padding + 'px');
};

ui.Dialog.prototype.alignRightEdge = function(padding) {
  var width = this._element.width();
  var left = window.innerWidth - width - padding;
  this._element.css('left', left + 'px');
};

ui.Dialog.prototype.alignBottomEdge = function(padding) {
  var height = this._element.height();
  var top = window.innerHeight - height - padding;
  this._element.css('top', top + 'px');
};

ui.Dialog.prototype.centerX = function() {
  var width = this._element.width();
  this._element.css('left', 'calc(50% - ' + Math.floor(width / 2) + 'px)');
};

ui.Dialog.prototype.centerY = function() {
  var height = this._element.height();
  this._element.css('top', 'calc(50% - ' + Math.floor(height / 2) + 'px)');
};

ui.Dialog.prototype.show = function() {
  ui.Widget.prototype.show.call(this);
  ui.bringToTop(this);
};

ui.Dialog.prototype.toggle = function() {
  ui.Widget.prototype.toggle.call(this);

  if (this._element.is(':visible')) {
    ui.bringToTop(this);
  }
};

ui.Dialog.prototype.close = function() {
  ui.removeDialog(this);
};

ui.dialog = function(template) {
  return new ui.Dialog(template);
};
