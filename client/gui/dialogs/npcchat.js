'use strict';
ui.loadTemplateFile('npcchat.html');

ui.NpcChatDialog = function(conversation) {
  ui.Dialog.call(this, 'npcchat.html');

  this._message = ui.label(this, '.label.message');
  this._options = ui.list(this, '.list.options');

  this._conversation = conversation;
  this._conversation.on('changed', this._update.bind(this));
  this._conversation.on('closed', this.close.bind(this));
  this._update();
}

ui.NpcChatDialog.prototype = Object.create(ui.Dialog.prototype);

ui.NpcChatDialog.prototype._selectOption = function(index) {
  if (index === 0) {
    this._conversation.end();
  } else {
    this._conversation.pickOption(index);
  }
};

ui.NpcChatDialog.prototype._update = function() {
  var options = this._conversation.options;
  var message = this._conversation.message;
  var index = 1;

  this._message.text(message);
  this._options.clear();

  for (var id in options) {
    if (options.hasOwnProperty(id)) {
      var item = ui.listitem();
      item.text(index + '. ' + options[id]);
      this._options.append(item).on('clicked', this._selectOption.bind(this, parseInt(id)));
      index++;
    }
  }

  var item = ui.listitem();
  item.text('0. Close');
  this._options.append(item).on('clicked', this._selectOption.bind(this, 0));
};

ui.npcChatDialog = function(conversation) {
  return new ui.NpcChatDialog(conversation);
};
