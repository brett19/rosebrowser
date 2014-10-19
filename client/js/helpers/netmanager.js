global.OBJECT_COMMAND = {
    STOP: 0,
    ATTACK: 1,
    SIT: 2,
    STAND: 3,
    MOVE: 4,
    DIE: 5,
    TOGGLE: 6,
    Skill2SELF: 7,
    Skill2OBJ: 8,
    Skill2POS: 9,
    MAX: 10
};

/**
 * This class handles tying together the networking clients with the
 * actual game world and GameObjectManager.
 *
 * @private
 */
function _NetManager() {
  this.world = null;
}

/**
 * @private
 */
_NetManager.prototype._destroyWorld = function() {
  throw new Error('Not Yet Supported');
};

/**
 * Begins watching a WorldClient and GameClient for events.
 *
 * Note: You must set the world property before calling this!
 *
 * @param {WorldClient} wn
 * @param {GameClient} gn
 */
_NetManager.prototype.watch = function(wn, gn) {
  var self = this;
  wn.on('end', function() {
    gn.end();
    self._destroyWorld();
  });
  gn.on('end', function() {
    wn.end();
    self._destroyWorld();
  });

  gn.on('inventory_data', function(data) {
    MC.inventory.setMoney(data.money);
    if (data.result === 0x1) {
      MC.inventory.setItems(data.items);
    } else if (data.result === 0x2) {
      MC.inventory.appendItems(data.items);
    } else {
      console.warn('Received unexpected inventory_data result.', data.result);
    }
  });

  gn.on('skill_data', function(data) {
    if (data.result === 0x1) {
      MC.skills.setSkills(data.skills);
    } else if (data.result === 0x2) {
      MC.skills.appendSkills(data.skills);
    } else {
      console.warn('Received unexpected skill_data result.', data.result);
    }
  });

  gn.on('inventory_change_items', function(data) {
    MC.inventory.changeItems(data.changeItems);
  });

  gn.on('quest_log', function(data) {
    MC.quests.setQuests(data.quests);
  });
  gn.on('quest_vars', function(data) {
    MC.quests.setVars(data.vars);
  });
  gn.on('questitem_list', function(data) {
    MC.quests.setItems(data.items);
  });
  gn.on('questitem_reward', function(data) {
    var itemData = GDM.getNow('item_data');
    var item = data.questItem.item;
    var name = itemData.getName(item.itemType, item.itemNo);

    // We don't actually update MC.quests here because server sends questitem_list anyway.
    if (data.result === RESULT_QUEST_REWARD_ADD_ITEM) {
      GCM.questReward('You have earned ' + name + ' (' + item.quantity + ').');
    } else if (data.result === RESULT_QUEST_REWARD_REMOVE_ITEM) {
      GCM.questReward('You have lost ' + name + ' (' + item.quantity + ').');
    }
  });
  gn.on('quest_completion_data', function(data) {
    MC.quests.setDailyLog(data.dailyLog);
  });


  var NETOBJCMD = {
    STOP: 0x0000,
    MOVE: 0x0001,
    ATTACK: 0x0002,
    DIE: 0x0003,
    PICKITEM: 0x0004,
    SKILL2SELF: 0x0006,
    SKILL2OBJ: 0x0007,
    SKILL2POS: 0x0008,
    RUNAWAY: 0x8009,
    SIT: 0x000a,
    STORE: 0x000b
  };
  function _setCommand(go, data) {
    switch (data.command) {
      case NETOBJCMD.DIE:
        // TODO
        break;
      case NETOBJCMD.SIT:
        // TODO
        break;
      case NETOBJCMD.STOP:
        go._stop();
        break;
      case NETOBJCMD.ATTACK:
        var targetObj = GZM.getRefByServerObjectIdx(
            data.targetObj, new THREE.Vector3(data.posTo.x, data.posTo.y, 0));
        go._attackObj(targetObj);
        break;
      case NETOBJCMD.RUNAWAY:
      case NETOBJCMD.MOVE:
      case NETOBJCMD.PICKITEM:
        if (data.targetObj) {
          var targetObj = GZM.getRefByServerObjectIdx(
              data.targetObj, new THREE.Vector3(data.posTo.x, data.posTo.y, 0));
          go._moveToObj(targetObj);
        } else {
          go._moveTo(data.posTo.x, data.posTo.y);
        }
      case NETOBJCMD.SKILL2SELF:
        // NOT IMPLEMENTED BY ANY CLIENT
        break;
      case NETOBJCMD.SKILL2OBJ:
        // NOT IMPLEMENTED BY ANY CLIENT
        break;
      case NETOBJCMD.SKILL2POS:
        // NOT IMPLEMENTED BY ANY CLIENT
        break;
    }
  }

  gn.on('spawn_npc', function(data) {
    var npc = new NpcObject(self.world);
    npc.serverObjectIdx = data.objectIdx;
    npc.eventIdx = data.eventIdx;
    npc.stats = new NpcStats(npc, data.charIdx);
    npc.setPosition(data.position.x, data.position.y, 10);
    npc.setDirection(data.modelDir / 180 * Math.PI);
    npc.pawn = new NpcPawn(npc);
    npc.setChar(Math.abs(data.charIdx));
    npc.ingStatus = new IngStatus(npc.pawn.rootObj, data.statusFlags, data.statusTimers);
    if (data.charIdx < 0) {
      npc.setVisible(false);
    }
    _setCommand(npc, data);
    for (var i = 0; i < data.eventStatuses.length; ++i) {
      npc.eventVar[i] = data.eventStatuses[i];
    }
    GZM.addObject(npc);
  });

  gn.on('spawn_char', function(data) {
    var char = new CharObject(self.world);
    char.serverObjectIdx = data.objectIdx;
    char.name = data.name;
    char.level = data.level;
    char.moveSpeed = data.runSpeed;
    char.setPosition(data.position.x, data.position.y, 10);
    char.gender = data.gender;
    char.hp = data.hp;
    char.job = data.job;
    char.hairColor = data.hairColor;
    char.visParts = data.parts;
    char.stats = new CharStats(char);
    char.stats.attackSpeed = data.attackSpeed;
    char.stats.attackSpeedBase = data.attackSpeedBase;
    char.pawn = new CharPawn(char);
    char.ingStatus = new IngStatus(char.pawn.rootObj, data.statusFlags, data.statusTimers, data.statusValues);
    char.debugValidate();
    _setCommand(char, data);
    GZM.addObject(char);
  });

  gn.on('spawn_mob', function(data) {
    var mob = new MobObject(self.world);
    mob.serverObjectIdx = data.objectIdx;
    mob.stats = new NpcStats(mob, data.charIdx);
    mob.setPosition(data.position.x, data.position.y, 10);
    mob.pawn = new NpcPawn(mob);
    mob.setChar(Math.abs(data.charIdx));
    mob.ingStatus = new IngStatus(mob.pawn.rootObj, data.statusFlags, data.statusTimers);
    if (data.charIdx < 0) {
      mob.setVisible(false);
    }
    _setCommand(mob, data);
    GZM.addObject(mob);
  });

  gn.on('dropitem', function(data) {
    var item = new ItemObject(self.world);
    item.serverObjectIdx = data.objectIdx;
    item.setPosition(data.position.x, data.position.y, 10);
    item.pawn = new ItemPawn(item);
    item.setItem(data.item);
    GZM.addObject(item);
  });

  gn.on('pickup_item', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);

    switch (data.result) {
    case REPLY_GET_FIELDITEM_REPLY_OK:
      if (data.item.itemType === ITEMTYPE.MONEY) {
        GCM.system('You have obtained ' + data.item.money + ' Zulie.');
      } else {
        var itemData = GDM.getNow('item_data');
        var name = itemData.getName(data.item.itemType, data.item.itemNo);

        if (ITMSTACKABLE[data.item.itemType]) {
          GCM.system('You have obtained ' + name + ' (' + data.item.quantity + ')');
        } else {
          GCM.system('You have obtained ' + name);
        }
      }

      MC.inventory.addItem(data.item);
      break;
    case REPLY_GET_FIELDITEM_REPLY_NONE:
      if (obj) {
        GZM.removeObject(obj);
      }
      break;
    case REPLY_GET_FIELDITEM_REPLY_NO_RIGHT:
      GCM.system('You have no right to pickup this item!');
      break;
    case REPLY_GET_FIELDITEM_REPLY_TOO_MANY:
      GCM.system('You have no space in your inventory!');
      break;
    };
  });

  gn.on('event_status', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj instanceof NpcObject) {
      obj.setEventVar(data.id, data.value);
    }
  });

  gn.on('obj_remove', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj) {
      GZM.removeObject(obj);
    }
  });

  gn.on('obj_moveto', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj instanceof MyCharacter) {
      return;
    }
    if (obj && !(obj instanceof ProxyObject)) {
      var targetObj = null;
      if (data.targetObjectIdx) {
        targetObj = GZM.getRefByServerObjectIdx(
            data.targetObjectIdx,
            new THREE.Vector3(data.posTo.x, data.posTo.y, data.posZ));
      }
      if (targetObj) {
        obj._moveToObj(targetObj);
      } else {
        obj._moveTo(data.posTo.x, data.posTo.y);
      }
    }
  });

  gn.on('obj_attack', function(data) {
    var attackerObj = GZM.findByServerObjectIdx(data.attackerObjectIdx);
    if (attackerObj instanceof MyCharacter) {
      return;
    }
    if (attackerObj && !(attackerObj instanceof ProxyObject)) {
      var defenderObj = GZM.getRefByServerObjectIdx(
          data.defenderObjectIdx,
          new THREE.Vector3(data.posTo.x, data.posTo.y, 0));
      attackerObj._attackObj(defenderObj);
      console.log('obj_attack', data);
    }
  });

  gn.on('self_skill', function(data) {
    var obj = GZM.findByServerObjectIdx(data.sourceObjectIdx);
    if (obj && !(obj instanceof ProxyObject)) {
      if (obj instanceof CharObject) {
        obj._skillToSelf(data.skillIdx);
        console.log('obj_self_skill', data);
      } else {
        console.log('obj_self_skill by non CharObject', data);
      }
    }
  });

  gn.on('target_skill', function(data) {
    var attackerObj = GZM.findByServerObjectIdx(data.sourceObjectIdx);
    if (attackerObj && !(attackerObj instanceof ProxyObject)) {
      if (attackerObj instanceof CharObject) {
        var defenderObj = GZM.getRefByServerObjectIdx(
            data.destObjectIdx,
            new THREE.Vector3(data.posTo.x, data.posTo.y, 0));
        attackerObj._skillToObj(defenderObj, data.skillIdx);
        console.log('obj_target_skill', data);
      } else {
        console.log('obj_target_skill by non CharObject', data);
      }
    }
  });

  gn.on('obj_motion', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj && obj instanceof CharObject) {
      obj._setMotion(data.motionNo);
    }
  });

  gn.on('toggle_sit', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj && obj instanceof CharObject) {
      obj._toggleSit();
    }
  });

  gn.on('damage', function(data) {
    var defenderObj = GZM.findByServerObjectIdx(data.defenderObjectIdx);
    if (defenderObj && !(defenderObj instanceof ProxyObject)) {
      defenderObj.emit('damage', data.amount);

      if (data.flags & 16) {
        defenderObj.emit('died');
        GZM.removeObject(defenderObj);
      }
    }
  });

  gn.on('skill_damage', function(data) {
    var defenderObj = GZM.findByServerObjectIdx(data.destObjectIdx);
    if (defenderObj && !(defenderObj instanceof ProxyObject)) {
      defenderObj.emit('damage', data.amount);

      if (data.flags & 16) {
        defenderObj.emit('died');
        GZM.removeObject(defenderObj);
      }
    }
  });

  gn.on('skill_effect', function(data) {
    var defenderObj = GZM.findByServerObjectIdx(data.destObjectIdx);
    if (defenderObj && !(defenderObj instanceof ProxyObject)) {
      defenderObj.ingStatus.applySkill(data.skillIdx, data.successBits, data.primaryStat, data.secondaryStat);
    }
  });

  gn.on('char_hpmp_info', function(data) {
    MC.hp = data.curHp;
    MC.mp = data.curMp;
    MC.recoveryHp = data.recoveryTickHp;
    MC.recoveryMp = data.recoveryTickMp;
    MC.changed();
  });

  gn.on('set_xp', function(data) {
    var fromObj = GZM.findByServerObjectIdx(data.fromObjectIdx);

    GCM.system('You have earned ' + (data.xp - MC.xp) + ' experience points.');
    MC.xp = data.xp;
    MC.stamina = data.stamina;
    MC.changed();

    if (fromObj && !(fromObj instanceof ProxyObject)) {
      GCM.system('You have defeated ' + fromObj.name + '.');
    }
  });

  gn.on('level_up', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);

    if ((obj instanceof MyCharacter) && data.level) {
      GCM.system('You are now level ' + data.level + '!');
      MC.level = data.level;
      MC.xp = data.xp;
      MC.statPoints = data.statPoints;
      MC.skillPoints = data.skillPoints;
      MC.changed();
    } else {
      // Play level up effect on obj!
    }
  });

  gn.on('chat_say', function(data) {
    var senderObj = GZM.findByServerObjectIdx(data.senderObjectIdx);
    if (senderObj && senderObj instanceof CharObject) {
      GCM.addGameMessage(MSG_TYPE.SAY, data.message, senderObj.name, senderObj);
    }
  });

  gn.on('chat_shout', function(data) {
    GCM.addGameMessage(MSG_TYPE.SHOUT, data.message, data.senderName);
  });

  gn.on('chat_whisper', function(data) {
    GCM.addGameMessage(MSG_TYPE.WHISPER, data.message, data.senderName);
  });

  gn.on('chat_party', function(data) {
    GCM.addGameMessage(MSG_TYPE.PARTY, data.message, data.senderName);
  });

  gn.on('chat_trade', function(data) {
    GCM.addGameMessage(MSG_TYPE.TRADE, data.message, data.senderName);
  });

  gn.on('chat_clan', function(data) {
    GCM.addGameMessage(MSG_TYPE.CLAN, data.message, data.senderName);
  });

  gn.on('chat_ally', function(data) {
    GCM.addGameMessage(MSG_TYPE.ALLY, data.message, data.senderName);
  });

  gn.on('quest_reply', function(data) {
    switch(data.result) {
      case RESULT_QUEST_REPLY_ADD_SUCCESS:
      case RESULT_QUEST_REPLY_ADD_FAILED:
      case RESULT_QUEST_REPLY_DEL_SUCCESS:
      case RESULT_QUEST_REPLY_DEL_FAILED:
      case RESULT_QUEST_REPLY_TRIGGER_SUCCESS:
      case RESULT_QUEST_REPLY_TRIGGER_FAILED:
      case RESULT_QUEST_REPLY_UPDATE:
      case RESULT_QUEST_REPLY_COMPLETE:
      case RESULT_QUEST_REPLY_RESET:
      case RESULT_QUEST_REPLY_DAILY_RESET:
      default:
        console.warn('Unimplemented quest reply result ' + data.result);
    }
  });

  gn.on('set_hot_icon', function(data) {
    MC.hotIcons.setIcon(data.id, data.type, data.slot);
  });

  gn.on('char_equip_item', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj instanceof CharObject) {
      var pawn = obj.pawn;
      var index = ITMPARTTOVISPART[data.equipIdx];

      if (index) {
        obj.visParts[index] = data.partItem;

        if (pawn instanceof CharPawn) {
          pawn.setModelPart(index, data.partItem.itemNo);
        }
      }
    }
  });

  gn.on('party_req', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);

    if (!(obj instanceof CharObject)) {
      console.warn('Invited to party by unknown objectIdx');
      return;
    }

    switch (data.request) {
    case PARTY_REQ_MAKE:
    case PARTY_REQ_JOIN:
      ui.messageBox(obj.name + ' has invited you to party', ['Accept', 'Decline'])
        .on('accept', function() {
          netGame.partyReply(PARTY_REPLY_ACCEPT_MAKE, data.objectIdx);
        })
        .on ('decline', function() {
          netGame.partyReply(PARTY_REPLY_REJECT_JOIN, data.objectIdx);
        });
      break;
    }
  });

  gn.on('party_reply', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    var name = '{Unknown}';

    if (obj instanceof CharObject) {
      name = obj.name;
    }

    switch (data.reply) {
    case PARTY_REPLY_ACCEPT_MAKE:
      MC.party.setLeaderByIdx(MC.serverObjectIdx);
      break;
    case PARTY_REPLY_NOT_FOUND:
      ui.messageBox('Party not found');
      break;
    case PARTY_REPLY_BUSY:
      ui.messageBox('Could not invite ' + name + ' to party, target is busy.');
      break;
    case PARTY_REPLY_REJECT_JOIN:
      ui.messageBox('Could not invite ' + name + ' to party, target rejected invite.');
      break;
    case PARTY_REPLY_DESTROY:
      MC.party.clear();
      break;
    case PARTY_REPLY_FULL_MEMBERS:
      ui.messageBox('Could not invite ' + name + ' to party, party is full.');
      break;
    case PARTY_REPLY_INVALID_LEVEL:
      ui.messageBox('Could not invite ' + name + ' to party, level requirements not met.');
      break;
    case PARTY_REPLY_CHANGE_OWNER:
      MC.party.setLeaderByIdx(data.objectIdx);
      break;
    case PARTY_REPLY_CHANGE_OWNERnDISCONN:
      MC.party.disconnectMember(MC.party.leaderTag);
      MC.party.setLeaderByIdx(data.objectIdx);
      break;
    case PAATY_REPLY_NO_CHARGE_TARGET:
      ui.messageBox('PAATY_REPLY_NO_CHARGE_TARGET');
      break;
    case PARTY_REPLY_DISCONNECT:
      MC.party.disconnectMember(data.objectTag);
      break;
    case PARTY_REPLY_BAN:
      MC.party.kickMember(data.objectTag);
      break;
    case PARTY_REPLY_SHARE_ENABLED:
      GCM.system('Party experience sharing is enabled.');
      break;
    case PARTY_REPLY_SHARE_DISABLED:
      GCM.system('Party experience sharing is disabled.');
      break;
    };
  });

  gn.on('party_member', function(data) {
    if (MC.party.exists) {
      if (data.leaverTag) {
        MC.party.leaveMember(data.leaverTag);

        if (data.leaverTag === MC.party.leaderTag) {
          var member = MC.party.findMemberByTag(data.newLeaderTag);
          MC.party.setLeader(member.serverIdx, member.serverTag);
        }
      } else {
        MC.party.addMembers(data.members);
      }
    } else {
      MC.party.create();
      MC.party.setRule(data.rule);
      MC.party.addMembers(data.members);

      if (MC.leaderTag !== MC.uniqueTag) {
        MC.party.setLeaderByIdx(data.members[0].serverIdx);
      }
    }
  });

  gn.on('party_member_update', function(data) {
    MC.party.updateMember(data.member.serverTag, data.member);
  });

  gn.on('party_xp', function(data) {
    MC.party.setLevelXP(data.level, data.xp);

    if (data.isLevelUp) {
      MC.party.levelup();
    }
  });

  gn.on('party_rule', function(data) {
    MC.party.setRule(data.rule);
  });

  gn.on('party_item', function(data) {
    var member = MC.party.findMemberByIdx(data.objectIdx);

    if (member) {
      if (data.item.itemType === ITEMTYPE.MONEY) {
        GCM.system(member.name + ' obtained ' + data.item.money + ' Zulie.');
      } else {
        var itemData = GDM.getNow('item_data');
        var name = this.itemData.getName(data.item.itemType, data.item.itemNo);

        if (ITMSTACKABLE[data.item.itemType]) {
          GCM.system(member.name + ' obtained ' + name + ' (' + data.item.quantity + ')');
        } else {
          GCM.system(member.name + ' obtained ' + name);
        }
      }
    }
  });
};

/**
 * @type {_NetManager}
 */
var NetManager = new _NetManager();
module.exports = NetManager;
