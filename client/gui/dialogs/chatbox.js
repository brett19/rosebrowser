'use strict';
ui.loadTemplateFile('chatbox.html');

ui.ChatBox = function() {
  ui.Dialog.call(this, 'chatbox.html');

  this._game = ui.label(this, '.label.game.messages');
  this._system = ui.label(this, '.label.system.messages');
  this._category = ui.radiogroup(this, '.radiogroup.chat-type');
  this._text = ui.textbox(this, '.textbox.message');

  this._text.on('returnpressed', this._sendMessage.bind(this))
  this._category.on('itemclicked', this._setCategory.bind(this));
  ui.button(this, '.button.send').on('clicked', this._sendMessage.bind(this));

  GCM.on('game_message', this._onGameMessage.bind(this));
  GCM.on('system_message', this._onSystemMessage.bind(this));
};

ui.ChatBox.prototype = Object.create(ui.Dialog.prototype);

ui.ChatBox.prototype._onGameMessage = function(message) {
  var html = '<div class="' + GCM.types[message.type].name + '">';
  html += message.sender.name + '&gt; ';
  html += message.message;
  html += '</div>';
  this._game.append(html);
  this._game.scrollToBottom();
};

ui.ChatBox.prototype._onSystemMessage = function(message) {
  var html = '<div class="' + GCM.types[message.type].name + '">';
  html += message.message;
  html += '</div>';
  this._system.append(html);
  this._system.scrollToBottom();
};

ui.ChatBox.prototype._setCategory = function(index) {
  var categories = ['', '$', '@', '#', '"', '~'];
  this._text.text(categories[index]);
};

ui.ChatBox.prototype._sendMessage = function() {
  var message = this._text.text();
  var reset = message[0];
  var sent;

  switch(message[0]) {
  case '!':
    sent = GCM.shout(message.substr(1));
    break;
  case '$':
    sent = GCM.trade(message.substr(1));
    break;
  case '@':
    sent = GCM.clan(message.substr(1));
    break;
  case '#':
    sent = GCM.party(message.substr(1));
    break;
  case '"':
    sent = GCM.whisper(message.substr(1));
    if (sent) {
      reset = message.substr(0, message.indexOf(' ') + 1);
    }
    break;
  case '~':
    sent = GCM.ally(message.substr(1));
    break;
  default:
    sent = GCM.say(message);
    reset = '';
  }

  if (sent) {
    this._text.text(reset);
  }
};

ui.chatBox = function() {
  return new ui.ChatBox();
};
