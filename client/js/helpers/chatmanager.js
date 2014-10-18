var EventEmitter = require('../util/eventemitter');

global.MSG_TYPE = {
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

var _ChatManager = function() {
  EventEmitter.call(this);

  this.types = [
    new _ChatManager.MessageType('say', null, this.say.bind(this)),
    new _ChatManager.MessageType('shout', '!', this.shout.bind(this)),
    new _ChatManager.MessageType('whisper', '"', this.whisper.bind(this)),
    new _ChatManager.MessageType('party', '#', this.clan.bind(this)),
    new _ChatManager.MessageType('trade', '$', this.trade.bind(this)),
    new _ChatManager.MessageType('clan', '@', this.clan.bind(this)),
    new _ChatManager.MessageType('ally', '~', this.clan.bind(this)),
    new _ChatManager.MessageType('system', null, this.system.bind(this)),
    new _ChatManager.MessageType('notice', null, this.notice.bind(this)),
    new _ChatManager.MessageType('error', null, this.error.bind(this)),
    new _ChatManager.MessageType('quest', null, this.quest.bind(this)),
    new _ChatManager.MessageType('quest-reward', null, this.questReward.bind(this))
  ];
};

_ChatManager.prototype = Object.create(EventEmitter.prototype);
_ChatManager.prototype.types = [];

_ChatManager.MessageType = function(name, prefix, sendFunc) {
  this.name = name;
  this.prefix = prefix;
  this.sendFunc = sendFunc;
};

_ChatManager.Message = function(type, message, sender, senderObject) {
  this.type = type;
  this.message = message;

  if (sender || senderObject) {
    this.sender = {
      name: sender,
      object: senderObject
    };
  }
};

_ChatManager.prototype.say = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatSay(message);
  return true;
};

_ChatManager.prototype.shout = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatShout(message);
  return true;
};

_ChatManager.prototype.whisper = function(message) {
  var match = message.match(/([^ ]*) (.*)/);
  if (!match) {
    return false;
  }

  this.addGameMessage(MSG_TYPE.WHISPER, match[2], 'To ' + match[1], null);
  netGame.chatWhisper(match[1], match[2]);
  return true;
};

_ChatManager.prototype.party = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatParty(message);
  return true;
};

_ChatManager.prototype.trade = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatTrade(message);
  return true;
};

_ChatManager.prototype.clan = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatClan(message);
  return true;
};

_ChatManager.prototype.ally = function(message) {
  if (!message) {
    return false;
  }

  netGame.chatAlly(message);
  return true;
};

_ChatManager.prototype.system = function(message) {
  this.addSystemMessage(MSG_TYPE.SYSTEM, message);
  return true;
};

_ChatManager.prototype.notice = function(message) {
  this.addSystemMessage(MSG_TYPE.NOTICE, message);
  return true;
};

_ChatManager.prototype.error = function(message) {
  this.addSystemMessage(MSG_TYPE.ERROR, message);
  return true;
};

_ChatManager.prototype.quest = function(message) {
  this.addSystemMessage(MSG_TYPE.QUEST, message);
  return true;
};

_ChatManager.prototype.questReward = function(message) {
  this.addSystemMessage(MSG_TYPE.QUEST_REWARD, message);
  return true;
};

_ChatManager.prototype.addGameMessage = function(type, message, sender, senderObject) {
  var message = new _ChatManager.Message(type, message, sender, senderObject);
  this.emit('game_message', message);
};

_ChatManager.prototype.addSystemMessage = function(type, message) {
  var message = new _ChatManager.Message(type, message);
  this.emit('system_message', message);
};

var GCM = new _ChatManager();
module.exports = GCM;
