'use strict';

ui.StatusDialog = function(template, message) {
  ui.Dialog.call(this, template);
  this.message = ui.label(this, '.label.status');

  if (message) {
    this.setMessage(message);
  }
}

ui.StatusDialog.prototype = Object.create(ui.Dialog.prototype);

ui.StatusDialog.prototype.setMessage = function(message) {
  this.message.text(message);
}

ui.statusDialog = function(message) {
  return new ui.StatusDialog('#dlgStatus', message);
};
