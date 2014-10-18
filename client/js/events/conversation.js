var EventEmitter = require('../util/eventemitter');
var QF = require('./luaquestfuncs');
var ConversationState = require('./conversationstate');

var Conversation = function(npcObj, spec, lang) {
  EventEmitter.call(this);

  this._state = new ConversationState(spec, lang);
  this._luaState = eval(lua_load(spec.luaData))();
  luaFunctions.init(this._luaState);

  this.npc = npcObj;
  this.message = '';
  this.options = {};
  this.dialog = null;
}

Conversation.prototype = Object.create(EventEmitter.prototype);

Conversation.prototype.start = function() {
  this._go();
};

Conversation.prototype.end = function() {
  this.emit('closed');
};

Conversation.prototype.pickOption = function(optionId) {
  this._state.condValue = optionId;
  this._go();
};

Conversation.prototype._formatString = function(string) {
  var search = /<[A-Z_]*>/g;
  var match;

  while(match = search.exec(string)) {
    var prefix = string.substr(0, match.index);
    var suffix = string.substr(match.index + match[0].length);
    var content = match[0].substr(1, match[0].length - 2);

    // https://github.com/brett19/RoseOnlineEvo/blob/master/Game/Client/Event/CEvent.cpp#L553-L585
    if (content === 'NAME') {
      content = MC.name;
    } else if (content === 'LEVEL') {
      content = MC.level;
    } else if (content === 'REVIVE_ZONE') {
      content = GF_getReviveZoneName();
    } else {
      content = match[0];
    }

    string = prefix + content + suffix;
  }

  return string;
};

Conversation.prototype._showDialog = function() {
  if (!this.dialog) {
    this.dialog = ui.npcChatDialog(this);
  } else {
    this.emit('changed');
  }
};

Conversation.prototype._go = function() {
  var running = true;
  while (running) {
    var reqval = this._state.exec();

    switch(reqval) {
    case CXECURREQ.CLOSE:
      this.end();
      running = false;
      break;
    case CXECURREQ.OPTCONDITION:
      this.message = this._formatString(this._state.message);
      this.options = this._state.options;

      for (var i = 0; i < this.options; ++i) {
        this.options[i] = this._formatString(this.options[i]);
      }

      this._showDialog();
      running = false;
      break;
    case CXECURREQ.LUACONDITION:
      var result = lua_tablegetcall(this._luaState, this._state.condParam, [this]);
      this._state.condValue = result[0];
      break;
    case CXECURREQ.LUAACTION:
      lua_tablegetcall(this._luaState, this._state.condParam, [this]);
      break;
    case CXECURREQ.QSDCONDITION:
      var result = QF.checkQuestCondition(this._state.condParam);
      this._state.condValue = result[0];
      break;
    case CXECURREQ.QSDACTION:
      QF.doQuestTrigger(this._state.condParam);
      break;
    default:
      console.warn('Received unknown request from ConversationState.');
      running = false;
    }
  }
};

module.exports = Conversation;
