'use strict';

var OBJECT_COMMAND = {
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
      console.warn('Received unexpected inventory_data result.')
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

  gn.on('spawn_npc', function(data) {
    var npc = new NpcObject(self.world);
    npc.serverObjectIdx = data.objectIdx;
    if (data.charIdx > 0) {
      npc.charIdx = data.charIdx;
    } else {
      npc.charIdx = -data.charIdx;
      npc.hidden = true;
    }
    npc.eventIdx = data.eventIdx;
    npc.stats = new NpcStats(npc);
    npc.setPosition(data.position.x, data.position.y, 10);
    npc.setDirection(data.modelDir / 180 * Math.PI);
    npc.pawn = new NpcPawn(npc);
    if (data.command === OBJECT_COMMAND.MOVE) {
      npc._moveTo(data.posTo.x, data.posTo.y);
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
    char.debugValidate();
    if (data.command === OBJECT_COMMAND.MOVE) {
      char._moveTo(data.posTo.x, data.posTo.y);
    }
    GZM.addObject(char);
  });

  gn.on('spawn_mob', function(data) {
    var mob = new MobObject(self.world);
    mob.serverObjectIdx = data.objectIdx;
    if (data.charIdx > 0) {
      mob.charIdx = data.charIdx;
    } else {
      mob.charIdx = -data.charIdx;
      mob.hidden = true;
    }
    mob.stats = new NpcStats(mob);
    mob.setPosition(data.position.x, data.position.y, 10);
    mob.pawn = new NpcPawn(mob);
    if (data.command === OBJECT_COMMAND.MOVE) {
      mob._moveTo(data.posTo.x, data.posTo.y);
    }
    GZM.addObject(mob);
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

  gn.on('set_xp', function(data) {
    var fromObj = GZM.findByServerObjectIdx(data.fromObjectIdx);

    GCM.system('You have earned ' + (data.xp - MC.xp) + ' experience points.');
    MC.xp = data.xp;
    MC.stamina = data.stamina;
    MC.changed();

    if (fromObj && !(fromObj instanceof ProxyObject)) {
      GCM.system('You have defeated ' + fromObj.pawn.name + '.');
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

  gn.on('char_equip_item', function(data) {
    var obj = GZM.findByServerObjectIdx(data.objectIdx);
    if (obj instanceof CharObject) {
      var pawn = obj.pawn;
      var index = ITMPARTTOVISPART[data.equipIdx];
      obj.visParts[index] = data.partItem;

      if (pawn instanceof CharPawn) {
        pawn.setModelPart(index, data.partItem.itemNo);
      }
    }
  });
};

/**
 * @type {_NetManager}
 */
var NetManager = new _NetManager();
