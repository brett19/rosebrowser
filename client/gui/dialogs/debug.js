'use strict';
ui.loadTemplateFile('debug.html');

ui.DebugDialog = function() {
  ui.Dialog.call(this, 'debug.html');

  this.controls = ui.panel(this, '.panel.controls');
  this.controls.hide();

  this.toggle = ui.button(this, '.button.toggle-controls');
  this.toggle.on('clicked', this.toggleControls.bind(this));
};

ui.DebugDialog.prototype = Object.create(ui.Dialog.prototype);

ui.DebugDialog.prototype.addButton = function(name, callback) {
  var button = ui.button();
  button.text(name);
  button._element.addClass('black');
  button.on('clicked', callback);
  this.controls.append(button);
  return button;
};

ui.DebugDialog.prototype.toggleControls = function() {
  this.controls.toggle();
};

ui.debugDialog = function() {
  return new ui.DebugDialog();
};
