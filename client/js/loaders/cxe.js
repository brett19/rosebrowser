'use strict';

function NpcChatData() {
}

var CXEBLOCKTYPE = {
  END: 0,
  INSTRUCTIONS: 1,
  STRINGS: 2,
  LUADATA: 3
};

var CXEINSTYPE = {
  NOP: 0,
  CLOSE: 1,
  JUMP: 2,
  JUMPIF: 3,
  SETMESSAGE: 4,
  SETOPTION: 5,
  CLEAROPTIONS: 6,
  OPTCONDITION: 7,
  LUACONDITION: 8,
  QSDCONDITION: 9,
  LUAACTION: 10,
  QSDACTION: 11
};

var CXECURREQ = {
  ERROR: 0,
  CLOSE: 1,
  OPTCONDITION: 2,
  LUACONDITION: 3,
  LUAACTION: 4,
  QSDCONDITION: 5,
  QSDACTION: 6
};

var CXEINSTTYPENAME = [];
for (var i in CXEINSTYPE) { CXEINSTTYPENAME[CXEINSTYPE[i]] = i; }

NpcChatData.load = function(path, callback) {
  ROSELoader.load(path, function(rh) {
    var data = new NpcChatData();

    var magic = rh.readStrLen(8);
    if (magic !== 'CXE1000') {
      throw new Error('Unexpected CXE magic header `' + magic + '` in `' + path + '`.');
    }

    data.instructions = [];
    data.strings = {};
    data.luaData = '';

    while (true) {
      var blockType = rh.readUint16();
      var blockLen = rh.readUint32();

      if (blockType === CXEBLOCKTYPE.INSTRUCTIONS) {
        var numInstructions = rh.readUint32();
        for (var i = 0; i < numInstructions; ++i) {
          var ins = {};
          ins.type = rh.readUint16();
          ins.typeName = CXEINSTTYPENAME[ins.type];
          switch (ins.type) {
            case CXEINSTYPE.NOP:
              break;
            case CXEINSTYPE.CLOSE:
              break;
            case CXEINSTYPE.JUMP:
              ins.jumpTarget = rh.readUint32();
              break;
            case CXEINSTYPE.JUMPIF:
              ins.condValue = rh.readUint32();
              ins.jumpTarget = rh.readUint32();
              break;
            case CXEINSTYPE.SETMESSAGE:
              ins.stringId = rh.readUint32();
              break;
            case CXEINSTYPE.SETOPTION:
              ins.optionId = rh.readUint32();
              ins.stringId = rh.readUint32();
              break;
            case CXEINSTYPE.CLEAROPTIONS:
              break;
            case CXEINSTYPE.OPTCONDITION:
              break;
            case CXEINSTYPE.LUACONDITION:
              ins.luaFuncName = rh.readUint32Str();
              break;
            case CXEINSTYPE.QSDCONDITION:
              ins.qsdTriggerName = rh.readUint32Str();
              break;
            case CXEINSTYPE.LUAACTION:
              ins.luaFuncName = rh.readUint32Str();
              break;
            case CXEINSTYPE.QSDACTION:
              ins.qsdTriggerName = rh.readUint32Str();
              break;
            default:
              throw new Error('Unexpected CXE instruction type.');
          }
          data.instructions.push(ins)
        }
      } else if (blockType === CXEBLOCKTYPE.STRINGS) {
        var langId = rh.readUint32Str();
        var numStrings = rh.readUint32();
        data.strings[langId] = {};
        for (var i = 0; i < numStrings; ++i) {
          var stringId = rh.readUint32();
          data.strings[langId][stringId] = rh.readUint32Str();
        }
      } else if (blockType === CXEBLOCKTYPE.LUADATA) {
        data.luaData = rh.readUint32Str();
      } else if (blockType === CXEBLOCKTYPE.END) {
        break;
      } else {
        throw new Error('Unexpected CXE block type.');
      }
    }

    callback(data);
  });
};

function ConversationState(conversationSpec, langId) {
  this.spec = conversationSpec;
  this.nextPc = 0;
  this.message = '';
  this.options = {};
  this.condValue = -1;
  this.condParam = '';
  this.langId = langId;
}

ConversationState.prototype._getStringById = function(stringId) {
  return this.spec.strings[this.langId][stringId];
}

ConversationState.prototype.exec = function() {
  this.condParam = '';

  while (true) {

    var currentPc = this.nextPc++;
    var ins = this.spec.instructions[currentPc];

    switch (ins.type) {
      case CXEINSTYPE.NOP:
        // Do Nothing
        continue;
      case CXEINSTYPE.CLOSE:
        // Lock PC to this instruction in case exec is called again
        this.nextPc = currentPc;
        return CXECURREQ.CLOSE;
      case CXEINSTYPE.JUMP:
        this.nextPc = ins.jumpTarget;
        continue;
      case CXEINSTYPE.JUMPIF:
        if (this.condValue === ins.condValue) {
          this.nextPc = ins.jumpTarget;
        }
        continue;
      case CXEINSTYPE.SETMESSAGE:
        this.message = this._getStringById(ins.stringId);
        continue;
      case CXEINSTYPE.SETOPTION:
        this.options[ins.optionId] = this._getStringById(ins.stringId);
        continue;
      case CXEINSTYPE.CLEAROPTIONS:
        this.options = {};
        continue;
      case CXEINSTYPE.OPTCONDITION:
        return CXECURREQ.OPTCONDITION;
      case CXEINSTYPE.LUACONDITION:
        this.condParam = ins.luaFuncName;
        return CXECURREQ.LUACONDITION;
      case CXEINSTYPE.QSDCONDITION:
        this.condParam = ins.qsdTriggerName;
        return CXECURREQ.QSDCONDITION;
      case CXEINSTYPE.LUAACTION:
        this.condParam = ins.luaFuncName;
        return CXECURREQ.LUAACTION;
      case CXEINSTYPE.QSDACTION:
        this.condParam = ins.qsdTriggerName;
        return CXECURREQ.QSDACTION;
    }
  }
};
