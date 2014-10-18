var ROSELoader = require('./rose');

function NpcChatData() {
}

global.CXEBLOCKTYPE = {
  END: 0,
  INSTRUCTIONS: 1,
  STRINGS: 2,
  LUADATA: 3
};

global.CXEINSTYPE = {
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

global.CXECURREQ = {
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

module.exports = NpcChatData;
