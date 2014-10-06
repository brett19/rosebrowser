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

ui.Dialog.prototype.centerX = function() {
  var width = this._element.width();
  this._element.css('left', 'calc(50% - ' + Math.floor(width / 2) + 'px)');
};

ui.Dialog.prototype.centerY = function() {
  var height = this._element.height();
  this._element.css('top', 'calc(50% - ' + Math.floor(height / 2) + 'px)');
};

ui.Dialog.prototype.show = function() {
  ui.bringToTop(this);
  ui.Widget.prototype.show.call(this);
};

ui.Dialog.prototype.close = function() {
  ui.removeDialog(this);
};

ui.dialog = function(template) {
  return new ui.Dialog(template);
};
