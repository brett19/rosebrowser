'use strict';

var MSGTYPE = {
  SYSTEM: 0,
  SAY: 1,
  SHOUT: 2,
  WHISPER: 3
};

function _ChatManager() {
  EventEmitter.call(this);

  this.messages = [];

  this.on('new_message', function(msg) {
    console.log('NEWMSG:', msg);
  });
}
_ChatManager.prototype = Object.create(EventEmitter.prototype);

_ChatManager.prototype.say = function(message) {
  netGame.chatSay(message);
  //this.addMessage(MSGTYPE.SAY, MC.name, MC, message);
};

_ChatManager.prototype.whisper = function(targetName, message) {
  netGame.chatWhisper(targetName, message);
  //this.addMessage(MSGTYPE.WHISPER, targetName, null, message);
};

_ChatManager.prototype.shout = function(message) {
  netGame.chatShout(message);
  //this.addMessage(MSGTYPE.SHOUT, message);
};

_ChatManager.prototype.addMessage = function(type, senderName, senderObj, message) {
  var msgObj = {
    type: type,
    senderName: senderName,
    senderObj: senderObj,
    message: message
  };
  this.messages.push(msgObj);
  this.emit('new_message', msgObj);
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
};

var GCM = new _ChatManager();
