'use strict';

ui.NpcChatDialog = function(template, conversation) {
  ui.Dialog.call(this, template);

  this.message = ui.label(this, '.label.message');
  this.options = ui.list(this, '.list.options');

  this.conversation = conversation;
  this.conversation.on('changed', this._update.bind(this));
  this.conversation.on('closed', this.close.bind(this));

  this._update();
}

ui.NpcChatDialog.prototype = Object.create(ui.Dialog.prototype);

ui.NpcChatDialog.prototype._selectOption = function(index) {
  if (index === 0) {
    this.conversation.end();
  } else {
    this.conversation.pickOption(index);
  }
};

ui.NpcChatDialog.prototype._update = function() {
  var options = this.conversation.options;
  var message = this.conversation.message;
  var index = 1;

  this.message.text(message);
  this.options.clear();

  for (var id in options) {
    if (options.hasOwnProperty(id)) {
      var item = $('<div></div>');
      item.text(index + '. ' + options[id]);
      this.options.append(item).on('clicked', this._selectOption.bind(this, parseInt(id)));
      index++;
    }
  }

  var item = $('<div>0. Close</div>');
  this.options.append(item).on('clicked', this._selectOption.bind(this, 0));
};

ui.npcChatDialog = function(conversation) {
  return new ui.NpcChatDialog('#dlgNpcChat', conversation);
};
