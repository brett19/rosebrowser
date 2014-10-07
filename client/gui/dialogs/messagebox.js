'use strict';
ui.loadTemplateFile('messagebox.html');

ui.MessageBoxDialog = function(message, buttons) {
  ui.Dialog.call(this, 'messagebox.html');

  this._message = ui.label(this, '.label.message');
  this._buttonArea = this._element.find('.button-area');

  this._message.text(message);

  if (buttons === undefined) {
    buttons = ['OK'];
  }

  for (var i = 0; i < buttons.length; ++i) {
    var button = ui.button();
    button._element.text(buttons[i]);
    button.on('clicked', this._onButtonClicked.bind(this, buttons[i]));
    this._buttonArea.append(button._element);
  }

  this.center();
}

ui.MessageBoxDialog.prototype = Object.create(ui.Dialog.prototype);

ui.MessageBoxDialog.prototype._onButtonClicked = function(button) {
  this.close();
  this.emit(button.toLowerCase());
};

ui.messageBox = function(message, buttons) {
  return new ui.MessageBoxDialog(message, buttons);
};
