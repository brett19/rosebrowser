'use strict';

function GameClient() {
  EventEmitter.call(this);

  this.socket = new RoseSocket();
  this.socket.name = 'gs';
  this.socket.on('connect', function() {
    console.log('GameClient connected');
  });
  this.socket.on('end', function() {
    console.log('GameClient ended');
  });
  var self = this;
  this.socket.on('packet', function(pak) {
    self._handlePacket(pak);
  });

  this.socket.logIgnoreCmds.push(0x7ec);
  this.socket.logIgnoreCmds.push(0x720);
}
GameClient.prototype = new EventEmitter();

GameClient.prototype.son = function(event, handler) {
  var self = this;
  var interHandler = function() {
    if (!handler.apply(self, arguments)) {
      self.socket.removeEventListener(event, interHandler);
    }
  };
  this.socket.addEventListener(event, interHandler);
};

GameClient.prototype.connect = function(host, port, transferKey, password, callback) {
  this.socket.connect(host, port);
  this.son('connect', function() {
    var pak = new RosePacket(0x70b);
    pak.addUint32(transferKey);
    pak.addString(CryptoJS.MD5(password).toString(CryptoJS.enc.Hex), true, true);
    this.socket.sendPacket(pak);
    this.son('packet', function(pak) {
      if (pak.cmd !== 0x70c) {
        console.log('received unexpected preconn packet');
        return true;
      }
      callback();
    });
  });
};
GameClient.prototype.end = function() {
  this.socket.end();
};

GameClient.prototype.joinZone = function(posZ, callback) {
  var opak = new RosePacket(0x753);
  opak.addInt16(posZ);
  this.socket.sendPacket(opak);

  this.son('packet', function(pak) {
    if (pak.cmd !== 0x753) {
      return true;
    }

    var data = {};
    data.objectIdx = pak.readUint16();
    data.curHp = pak.readInt32();
    data.curMp = pak.readInt32();
    data.curExp = pak.readUint32();
    data.penalExp = pak.readUint32();
    // TODO: The rest of this...
    //   ...GlobalVars
    //   dwGlobalFlags
    //   dwWorldTime
    //   iTeamNo
    //   nQuestEmote
    callback(data);
  });
};

GameClient.prototype.moveTo = function(x, y, z) {
  var opak = new RosePacket(0x79a);
  opak.addUint16(0);
  opak.addFloat(x * 100);
  opak.addFloat(y * 100);
  opak.addInt16(z * 100);
  this.socket.sendPacket(opak);

  /*
  this.son('packet', function(pak) {
    if (pak.cmd !== 0x79a) {
      return true;
    }

    callback(data);
  });
  */
};

/**
 * Little helper to emit packet events that can be logged.
 * @param {string} event
 * @param {object} data
 * @private
 */
GameClient.prototype._emitPE = function(event, data) {
  console.log('client:event<'+this.socket.name+'>', event, data);
  this.emit.call(this, event, data);
};

/**
 * Handle parsing of unsoliceted packets.
 * @param {RosePacket} pak
 * @private
 */
GameClient.prototype._handlePacket = function(pak) {
  var packetHandler = GameClient.packetHandlers[pak.cmd];
  if (packetHandler) {
    packetHandler.call(this, pak, {});
  }
};
GameClient.packetHandlers = {};
GameClient._registerHandler = function(cmd, handler) {
  GameClient.packetHandlers[cmd] = handler;
};

GameClient._registerHandler(0x715, function(pak, data) {
  data.gender = pak.readUint8();
  data.zoneNo = pak.readInt32();
  data.posStart = pak.readVector2().divideScalar(100);
  data.reviveZoneNo = pak.readInt32();
  data.parts = [];
  for (var j = 0; j < AVTBODYPART.Max; ++j) {
    data.parts.push(pak.readPartItem());
  }
  { // tagBasicINFO
    data.birthStone = pak.readInt8();
    data.faceIdx = pak.readInt8();
    data.hairIdx = pak.readInt8();
    data.job = pak.readInt16();
    data.union = pak.readInt8();
    data.rank = pak.readInt8();
    data.fame = pak.readInt8();
  }
  { // tagBasicAbility
    data.stats = {};
    data.stats.str = pak.readInt16();
    data.stats.dex = pak.readInt16();
    data.stats.int = pak.readInt16();
    data.stats.con = pak.readInt16();
    data.stats.cha = pak.readInt16();
    data.stats.sen = pak.readInt16();
  }
  { // tagGrowAbility
    data.hp = pak.readInt32();
    data.mp = pak.readInt32();
    data.exp = pak.readUint32();
    data.level = pak.readInt16();
    data.bonusPoint = pak.readInt16();
    data.skillPoint = pak.readInt16();
    data.bodySize = pak.readUint8();
    data.headSize = pak.readUint8();
    data.penalExp = pak.readUint32();
    data.fameG = pak.readInt16();
    data.fameB = pak.readInt16();
    data.pkFlag = pak.readInt16();
    data.stamina = pak.readInt16();
    data.patHp = pak.readInt32();
    data.patCoolTime = pak.readUint32();
  }
  data.currency = [];
  for (var r = 0; r < 10; ++r) {
    data.currency.push(pak.readInt32());
  }
  data.maintainStatus = [];
  for (var o = 0; o < 40; ++o) {
    var mtns = {};
    mtns.expireSec = pak.readUint32();
    mtns.value = pak.readInt16();
    mtns.dummy = pak.readInt16();
    data.maintainStatus.push(mtns);
  }
  data.hotIcons = [];
  for (var p = 0; p < 48; ++p) {
    data.hotIcons.push(pak.readUint16());
  }
  data.uniqueTag = pak.readUint32();
  data.coolTime = [];
  for (var q = 0; q < 20; ++q) {
    data.coolTime.push(pak.readUint32());
  }
  data.name = pak.readString();
  this._emitPE('char_data', data);
});

GameClient._registerHandler(0x826, function(pak, data) {
  /*clientTime*/ pak.skip(8);
  /*serverTime*/ pak.skip(8);
  /*year*/ pak.readInt32();
  /*month*/ pak.readInt32();
  /*day*/ pak.readInt32();
  /*hour*/ pak.readInt32();
  /*min*/ pak.readInt32();
  /*sec*/ pak.readInt32();
  /*isDst*/ pak.readInt32(); // !== 0 (boolean)
  this._emitPE('server_time', data);
});

GameClient._registerHandler(0x729, function(pak, data) {
  data.state = pak.readUint8();
  this._emitPE('preload_char', data);
});

GameClient._registerHandler(0x724, function(pak, data) {
  data.result = pak.readUint8();
  var wishCount = pak.readUint16();
  data.items = [];
  for (var i = 0; i < wishCount; ++i) {
    data.items.push(pak.readItem());
  }
  this._emitPE('wish_list', data)
});

GameClient._registerHandler(0x716, function(pak, data) {
  data.result = pak.readUint8();
  data.money = pak.readUint64();
  var itemCount = pak.readUint16();
  data.items = [];
  for (var j = 0; j < itemCount; ++j) {
    data.items.push(pak.readItem());
  }
  this._emitPE('inventory_data', data);
});

GameClient._registerHandler(0x855, function(pak, data) {
  data.result = pak.readUint8();
  data.dailyQuests = pak.readUint32();
  data.questCount = pak.readUint32();
  this._emitPE('quest_completion_data', data);
});

GameClient._registerHandler(0x723, function(pak, data) {
  data.result = pak.readUint8();
  var qitemCount = pak.readUint16();
  data.items = [];
  for (var k = 0; k < qitemCount; ++k) {
    var questNo = pak.readInt32();
    var qitem = pak.readItem();
    qitem.questNo = questNo;
    data.items.push(qitem);
  }
  this._emitPE('questitem_list', data);
});

GameClient._registerHandler(0x71b, function(pak, data) {
  // TODO: This packet...
  data.result = pak.readUint8();
  this._emitPE('quest_data', data);
});

GameClient._registerHandler(0x71a, function(pak, data) {
  data.result = pak.readUint8();
  var skillCount = pak.readInt16();
  data.skills = [];
  for (var l = 0; l < skillCount; ++l) {
    var skill = {};
    skill.slot = pak.readInt16();
    skill.skillIdx = pak.readInt16();
    skill.expireSec = pak.readInt32();
    data.skills.push(skill);
  }
  this._emitPE('skill_data', data);
});

GameClient._registerHandler(0x7ec, function(pak, data) {
  data.curHp = pak.readInt32();
  data.curMp = pak.readInt32();
  data.recoveryTickHp = pak.readInt32();
  data.recoveryTickMp = pak.readInt32();
  /*forceUpdate -- Not sure the size here*/
  this._emitPE('char_hpmp_info', data);
});

function handleAddChar(pak, data) {
  data.objectIdx = pak.readUint16();
  data.position = pak.readVector2().divideScalar(100);
  data.posTo = pak.readVector2().divideScalar(100);
  data.command = pak.readUint16();
  data.targetObj = pak.readUint16();
  data.rideObj = pak.readUint16();
  data.moveMode = pak.readUint8();
  data.hp = pak.readInt32();
  data.teamNo = pak.readInt32();
  data.statusFlags = pak.readUint64();
  data.statusTimers = [];
  for (var si = 0; si < 66; ++si) {
    data.statusTimers.push(pak.readInt16());
  }
}
function handleAddMob(pak, data) {
  handleAddChar(pak, data);
  data.charIdx = pak.readInt16();
  data.questIdx = pak.readInt16();
}
function handleAddNpc(pak, data) {
  handleAddMob(pak, data);
  data.modelDir = pak.readFloat();
  data.eventStatuses = [];
  for (var ei = 0; ei < 5; ++ei) {
    data.eventStatuses.push(pak.readInt16());
  }
}
function handleAddAvatar(pak, data) {
  handleAddChar(pak, data);
  data.dbId = pak.readUint32();
  data.gender = pak.readUint8();
  data.runSpeedBase = pak.readInt16();
  data.runSpeed = pak.readInt16();
  data.attackSpeedBase = pak.readInt16();
  data.attackSpeed = pak.readInt16();
  data.weightRate = pak.readUint8();
  data.parts = [];
  for (var j = 0; j < AVTBODYPART.Max; ++j) {
    data.parts.push(pak.readPartItem());
  }
  data.shotItems = [];
  for (var k = 0; k < AVTSHOTTYPE.Max; ++k) {
    data.shotItems.push(pak.readInt16());
  }
  data.job = pak.readInt16();
  data.level = pak.readUint8();
  data.questEmoticon = pak.readInt16();
  data.rideParts = [];
  for (var j = 0; j < AVTRIDEPART.Max; ++j) {
    data.rideParts.push(pak.readPartItem());
  }
  { // tagMOUNT
    data.mount = {};
    data.mount.mounted = pak.readUint8() !== 0;
    data.mount.mountId = pak.readInt32();
    data.mount.mountRunning = pak.readUint8() !== 0;
  }
  data.posZ = pak.readInt16();
  data.subStatusFlags = pak.readUint64();
  data.hairColor = pak.readUint8();
  data.statusTimers = [];
  for (var si = 0; si < 66; ++si) {
    data.statusTimers.push(pak.readInt16());
  }
  data.name = pak.readString();

  // How we read these is a bit dirty...
  if (data.statusFlags.lo & CHARSTATUSLO.MAX_HP) {
    data.flagMaxHp = pak.readInt16();
  }
  if (data.statusFlags.lo & CHARSTATUSLO.INC_MOV_SPEED) {
    data.flagIncMovSpeed = pak.readInt16();
  }
  if (data.statusFlags.lo & CHARSTATUSLO.DEC_MOV_SPEED) {
    data.flagDecMovSpeed = pak.readInt16();
  }
  if (data.statusFlags.lo & CHARSTATUSLO.INC_ATK_SPEED) {
    data.flagIncAtkSpeed = pak.readInt16();
  }
  if (data.statusFlags.lo & CHARSTATUSLO.DEC_ATK_SPEED) {
    data.flagDecAtkSpeed = pak.readInt16();
  }
  if (data.statusFlags.lo & CHARSTATUSLO.DEC_LIFE_TIME) {
    data.flagCallerIdx = data.readUint16();
    if (data.flagCallerIdx) {
      data.flagSummonedSkillIdx = data.readInt16();
    }
  }

  if (data.subStatusFlags.lo & CHARFLAGSLO.STORE) {
    data.storeSkin = pak.readInt16();
    data.storeTitle = pak.readString();
  } else if (data.subStatusFlags.lo & CHARFLAGSLO.CHAT) {
    data.chatTitle = pak.readString();
  }

  if (!pak.isReadEof()) {
    data.clan = {};
    data.clan.id = pak.readUint32();
    data.clan.mark = pak.readUint32();
    data.clan.level = pak.readUint8();
    data.clan.position = pak.readUint8();
    data.clan.name = pak.readString();
  }
}
GameClient._registerHandler(0x791, function(pak, data) {
  handleAddNpc(pak, data);
  this._emitPE('spawn_npc', data);
});
GameClient._registerHandler(0x792, function(pak, data) {
  handleAddMob(pak, data);
  this._emitPE('spawn_mob', data);
});
GameClient._registerHandler(0x793, function(pak, data) {
  handleAddAvatar(pak, data);
  this._emitPE('spawn_char', data);
});

GameClient._registerHandler(0x79a, function(pak, data) {
  data.objectIdx = pak.readUint16();
  data.targetObjectIdx = pak.readUint16();
  data.serverDist = pak.readInt16();
  data.posTo = pak.readVector2().divideScalar(100);
  data.posZ = pak.readInt16();
  this._emitPE('obj_moveto', data);
});

GameClient._registerHandler(0x794, function(pak, data) {
  while (!pak.isReadEof()) {
    data.objectIdx = pak.readUint16();
    this._emitPE('obj_remove', data);
  }
});

var netGame = null;
