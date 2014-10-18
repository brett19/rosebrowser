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
};

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

module.exports = ConversationState;
