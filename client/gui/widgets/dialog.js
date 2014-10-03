'use strict';

ui.Dialog = function(template) {
  var element = ui.loadFromTemplate(template);
  ui.Widget.call(this, this, element);
  ui.addDialog(this);

  ui.titlebar(this, '.title');
  ui.button(this, '.close').on('clicked', this.hide.bind(this));
};

ui.Dialog.prototype = Object.create(ui.Widget.prototype);

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
