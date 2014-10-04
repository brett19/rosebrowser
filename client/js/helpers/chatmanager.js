'use strict';

var MSG_TYPE = {
  SAY: 0,
  SHOUT: 1,
  WHISPER: 2,
  PARTY: 3,
  TRADE: 4,
  CLAN: 5,
  ALLY: 6,
  SYSTEM: 7,
  NOTICE: 8,
  ERROR: 9,
  QUEST: 10,
  QUEST_REWARD: 11
};

var ChatManager = function() {
  EventEmitter.call(this);

  this.types = [
    new ChatManager.MessageType('say', null, this.say.bind(this)),
    new ChatManager.MessageType('shout', '!', this.shout.bind(this)),
    new ChatManager.MessageType('whisper', '"', this.whisper.bind(this)),
    new ChatManager.MessageType('party', '#', this.clan.bind(this)),
    new ChatManager.MessageType('trade', '$', this.trade.bind(this)),
    new ChatManager.MessageType('clan', '@', this.clan.bind(this)),
    new ChatManager.MessageType('ally', '~', this.clan.bind(this)),
    new ChatManager.MessageType('system', null, this.system.bind(this)),
    new ChatManager.MessageType('notice', null, this.notice.bind(this)),
    new ChatManager.MessageType('error', null, this.error.bind(this)),
    new ChatManager.MessageType('quest', null, this.quest.bind(this)),
    new ChatManager.MessageType('quest-reward', null, this.questReward.bind(this))
  ];
};

ChatManager.prototype = Object.create(EventEmitter.prototype);
ChatManager.prototype.types = [];

ChatManager.MessageType = function(name, prefix, sendFunc) {
  this.name = name;
  this.prefix = prefix;
  this.sendFunc = sendFunc;
};

ChatManager.Message = function(type, message, sender, senderObject) {
  this.type = type;
  this.message = message;

  if (sender || senderObject) {
    this.sender = {
      name: sender,
      object: senderObject
    };
  }
};

ChatManager.prototype.say = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatSay(message);
  return true;
};

ChatManager.prototype.shout = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatShout(message);
  return true;
};

ChatManager.prototype.whisper = function(message) {
  var match = message.match(/([^ ]*) (.*)/);
  if (!match) {
    return false;
  }

  netGame.chatWhisper(match[1], match[2]);
  return true;
};

ChatManager.prototype.party = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatParty(message);
  return true;
};

ChatManager.prototype.trade = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatTrade(message);
  return true;
};

ChatManager.prototype.clan = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatClan(message);
  return true;
};

ChatManager.prototype.allied = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatAllied(message);
  return true;
};

ChatManager.prototype.system = function(message) {
  this.addSystemMessage('system', message);
  return true;
};

ChatManager.prototype.notice = function(message) {
  this.addSystemMessage('notice', message);
  return true;
};

ChatManager.prototype.error = function(message) {
  this.addSystemMessage('error', message);
  return true;
};

ChatManager.prototype.quest = function(message) {
  this.addSystemMessage('quest', message);
  return true;
};

ChatManager.prototype.questReward = function(message) {
  this.addSystemMessage('quest-reward', message);
  return true;
};

ChatManager.prototype.addGameMessage = function(type, message, sender, senderObject) {
  var message = new ChatManager.Message(type, message, sender, senderObject);
  this.emit('game_message', message);
};

ChatManager.prototype.addSystemMessage = function(type, message) {
  var message = new ChatManager.Message(type, message);
  this.emit('system_message', message);
};

var GCM = new ChatManager();
