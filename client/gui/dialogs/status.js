'use strict';
ui.loadTemplateFile('status.html');

ui.StatusDialog = function(message) {
  ui.Dialog.call(this, 'status.html');
  this._label = ui.label(this, '.label.status');
  this.setMessage(message);
}

ui.StatusDialog.prototype = Object.create(ui.Dialog.prototype);

ui.StatusDialog.prototype.setMessage = function(message) {
  this._message = message;
  this._update();
};

ui.StatusDialog.prototype._update = function() {
  this._label.text(this._message);
};

ui.statusDialog = function(message) {
  return new ui.StatusDialog(message);
};
