'use strict';

function TestGui() {
}

TestGui.KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 45,
  HOME: 46,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  INSERT: 45,
  DELETE: 46
};

TestGui._highZ = 1;
TestGui.tpls = null;

TestGui._element = $('<div class="gui" />');
$('body').append(TestGui._element);
TestGui._el = function() {
  return TestGui._element;
};

TestGui.moveableify = function(el) {
  if (!el.hasClass('moveable')) {
    return;
  }

  el.children('.title').mousedown(function(downEvent) {
    console.log('DOWN!');
    downEvent.preventDefault();
    var elTarget = $(downEvent.target).parent();
    elTarget.css('z-index', TestGui._highZ++);
    var initial = elTarget.offset();

    function mouseMove(moveEvent) {
      elTarget.offset({
        left: moveEvent.pageX-downEvent.pageX+initial.left,
        top: moveEvent.pageY-downEvent.pageY+initial.top
      });
    }
    function mouseUp() {
      $(document).off('mousemove', mouseMove);
      $(document).off('mouseup', mouseUp);
    }
    $(document).on('mousemove', mouseMove);
    $(document).on('mouseup', mouseUp);
  });
};

TestGui.listify = function(el) {
  var items = el.children('.item');
  function deselectAll() {
    for (var j = 0; j < items.length; ++j) {
      $(items[j]).removeClass('selected');
    }
  }
  for (var i = 0; i < items.length; ++i) {
    (function(item) {
      item.click(function() {
        deselectAll();
        item.addClass('selected');
      });
    })($(items[i]));
  }
};



TestGui.Dialog = function(tplSel) {
  EventEmitter.call(this);

  var tplEl = TestGui.tpls.find(tplSel);
  var tplName = tplEl.attr('id');
  this._element = tplEl.clone();
  TestGui.moveableify(this._element);
  this._element.attr('id', tplName + '_' + TestGui.Dialog._instanceIdx++);
  this._element.hide();
  TestGui._el().append(this._element);
};
TestGui.Dialog.prototype = Object.create(EventEmitter.prototype);

TestGui.Dialog._instanceIdx = 1;

TestGui.Dialog.prototype._el = function() {
  return this._element;
};

TestGui.Dialog.prototype._find = function(sel) {
  return this._element.find(sel);
};

TestGui.Dialog.prototype._destroy = function() {
  if (this._element) {
    this._element.remove();
    this._element = null;
  }
};




function _LoginDialog() {
  TestGui.Dialog.call(this, '#dlgLogin');

  var savedUser = localStorage.getItem('login_user');
  if (savedUser) {
    this._find('.username').val(savedUser);
  }

  this._find('.submit').click(function(e) {
    this._login();
  }.bind(this));

  this._find('.username').keydown(function(e) {
    if (e.keyCode === TestGui.KEYS.ENTER) {
      this._login();
    }
  }.bind(this));

  this._find('.password').keydown(function(e) {
    if (e.keyCode === TestGui.KEYS.ENTER) {
      this._login();
    }
  }.bind(this));

  this._el().show();
}
_LoginDialog.prototype = Object.create(TestGui.Dialog.prototype);

_LoginDialog.prototype.cancel = function() {
  this._destroy();
};

_LoginDialog.prototype._login = function() {
  var rUser = this._find('.username').val();
  var rPass = this._find('.password').val();
  localStorage.setItem('login_user', rUser);

  this.emit('done', rUser, rPass);
  this._destroy();
};

TestGui.prototype.requestLogin = function() {
  return new _LoginDialog();
};



function _SrvSelDialog(serverList) {
  TestGui.Dialog.call(this, '#dlgSrvSel');

  var list = this._find('.servers');
  list.empty();
  for (var i = 0; i < serverList.length; ++i) {
    var serverName = serverList[i].name.substr(1);
    var serverId = serverList[i].id;

    var item = $('<div class="item" />');
    item.html(serverName);
    list.append(item);

    item.dblclick(this._selectServer.bind(this, serverId));

    if (i === 0) {
      item.addClass('selected');
    }
  }
  TestGui.listify(list);

  this._keyDownCallback = this._onKeyDown.bind(this);
  InputManager.on('keydown', this._keyDownCallback);

  this._el().show();
}
_SrvSelDialog.prototype = Object.create(TestGui.Dialog.prototype);

_SrvSelDialog.prototype.cancel = function() {
  this._destroy();
};

_SrvSelDialog.prototype._selectServer = function(serverId) {
  this.emit('done', serverId);
  this._destroy();
};

_SrvSelDialog.prototype._onKeyDown = function(e) {
  var selected = this._find('.servers').children('.selected');
  if (e.keyCode === TestGui.KEYS.ENTER) {
    selected.dblclick();
  } else if (e.keyCode === TestGui.KEYS.UP_ARROW) {
    selected.prev().click();
  } else if (e.keyCode === TestGui.KEYS.DOWN_ARROW) {
    selected.next().click();
  }
};

_SrvSelDialog.prototype._destroy = function() {
  TestGui.Dialog.prototype._destroy.call(this);
  InputManager.removeEventListener('keydown', this._keyDownCallback);
};


TestGui.prototype.pickServer = function(serverList) {
  return new _SrvSelDialog(serverList);
};



function _CharSelDialog(characterList) {
  TestGui.Dialog.call(this, '#dlgCharSel');

  console.log(characterList);

  var list = this._find('.characters');
  list.empty();
  for (var i = 0; i < characterList.length; ++i) {
    var char = characterList[i];

    var charHtml = '';
    charHtml += '<b>' + char.name + '</b><br />';
    charHtml += 'Level: ' + char.level + '<br />';
    charHtml += 'Location: ' + char.zoneName;

    var item = $('<div class="item" />');
    item.html(charHtml);
    list.append(item);

    item.click(this._selectCharacter.bind(this, i));
    item.dblclick(this._playCharacter.bind(this, char.name));

    if (i === 0) {
      item.addClass('selected');
    }
  }
  TestGui.listify(list);

  this._keyDownCallback = this._onKeyDown.bind(this);
  InputManager.on('keydown', this._keyDownCallback);

  this._el().show();
}
_CharSelDialog.prototype = Object.create(TestGui.Dialog.prototype);

_CharSelDialog.prototype.cancel = function() {
  this._destroy();
};

_CharSelDialog.prototype._selectCharacter = function(characterId) {
  this.emit('selectionChanged', characterId);
};

_CharSelDialog.prototype._playCharacter = function(characterName) {
  this.emit('done', characterName);
  this._destroy();
};

_CharSelDialog.prototype._onKeyDown = function(e) {
  var selected = this._find('.characters').children('.selected');
  if (e.keyCode === TestGui.KEYS.ENTER) {
    selected.dblclick();
  } else if (e.keyCode === TestGui.KEYS.UP_ARROW) {
    selected.prev().click();
  } else if (e.keyCode === TestGui.KEYS.DOWN_ARROW) {
    selected.next().click();
  }
};

_CharSelDialog.prototype._destroy = function() {
  TestGui.Dialog.prototype._destroy.call(this);
  InputManager.removeEventListener('keydown', this._keyDownCallback);
};

TestGui.prototype.pickCharacter = function(characterList) {
  return new _CharSelDialog(characterList);
};




function _StatusDialog() {
  TestGui.Dialog.call(this, '#dlgStatus');

  this._el().show();
}
_StatusDialog.prototype = Object.create(TestGui.Dialog.prototype);

_StatusDialog.prototype.setMessage = function(message) {
  this._find('.content').html(message);
};

_StatusDialog.prototype.close = function() {
  this._destroy();
};

TestGui.prototype.newStatusDialog = function(initialMessage) {
  var newDialog = new _StatusDialog();
  if (initialMessage) {
    newDialog.setMessage(initialMessage);
  }
  return newDialog;
};


function _NpcChatDialog(conversation) {
  TestGui.Dialog.call(this, '#dlgNpcChat');

  this.convo = conversation;

  var self = this;
  this.convo.on('changed', function() {
    self._update();
  });
  this.convo.on('closed', function() {
    self._destroy();
  });

  this._update();
  this._el().show();
}
_NpcChatDialog.prototype = Object.create(TestGui.Dialog.prototype);

_NpcChatDialog.prototype._selectOption = function(optionId) {
  if (optionId === 0) {
    this.convo.close();
  } else {
    this.convo.pickOption(optionId);
  }
};

_NpcChatDialog.prototype._update = function() {
  this._find('.message').text(this.convo.message);

  var options = this.convo.options;
  var list = this._find('.options');
  list.empty();
  var optionNum = 1;
  for (var i in options) {
    if (options.hasOwnProperty(i)) {
      var thisOptionNum = optionNum++;
      var item = $('<div class="item" />');
      item.text(thisOptionNum + '. ' + options[i]);
      list.append(item);

      item.click(this._selectOption.bind(this, parseInt(i)));
    }
  }
  { // Add an option to close
    var item = $('<div class="item" />');
    item.text('0. Close');
    list.append(item);
    item.click(this._selectOption.bind(this, 0));
  }
};

TestGui.prototype.newNpcChatDialog = function(conversation) {
  return new _NpcChatDialog(conversation);
};



function GenerateItemToolHtml(itm) {
  var itemText = '';

  // TODO: Move this reference to the place that creates inventory data
  var ItemDb = GDM.getNow('item_data');
  var itmData = ItemDb.getData(itm.itemType, itm.itemNo);
  var itmName = ItemDb.getName(itm.itemType, itm.itemNo);

  itemText += '<b>' + itmName + '</b><br />';

  return itemText;
}

function _CharInfoDialog(charInfo) {
  TestGui.Dialog.call(this, '#dlgCharInfo');

  this._find('.name').text(charInfo.name);
  this._find('.level').text(charInfo.level);

  this._el().show();
}
_CharInfoDialog.prototype = Object.create(TestGui.Dialog.prototype);



function _InventoryDialog(invData) {
  TestGui.Dialog.call(this, '#dlgInventory');

  this.data = invData;
  this._update();

  this._find('.avttab').click(function() {
    this._find('.avttab').addClass('selected');
    this._find('.csttab').removeClass('selected');
    this._find('.pattab').removeClass('selected');
    this._find('.avttabp').show();
    this._find('.pattabp').hide();
    this._find('.acttabp').show();
    this._find('.csttabp').hide();
  }.bind(this));
  this._find('.csttab').click(function() {
    this._find('.avttab').removeClass('selected');
    this._find('.csttab').addClass('selected');
    this._find('.pattab').removeClass('selected');
    this._find('.avttabp').show();
    this._find('.pattabp').hide();
    this._find('.acttabp').hide();
    this._find('.csttabp').show();
  }.bind(this));
  this._find('.pattab').click(function() {
    this._find('.avttab').removeClass('selected');
    this._find('.csttab').removeClass('selected');
    this._find('.pattab').addClass('selected');
    this._find('.avttabp').hide();
    this._find('.pattabp').show();
  }.bind(this));

  this._find('.eqptab').click(function() {
    this._find('.eqptab').addClass('selected');
    this._find('.usetab').removeClass('selected');
    this._find('.mattab').removeClass('selected');
    this._find('.eqptabp').show();
    this._find('.usetabp').hide();
    this._find('.mattabp').hide();
  }.bind(this));
  this._find('.usetab').click(function() {
    this._find('.eqptab').removeClass('selected');
    this._find('.usetab').addClass('selected');
    this._find('.mattab').removeClass('selected');
    this._find('.eqptabp').hide();
    this._find('.usetabp').show();
    this._find('.mattabp').hide();
  }.bind(this));
  this._find('.mattab').click(function() {
    this._find('.eqptab').removeClass('selected');
    this._find('.usetab').removeClass('selected');
    this._find('.mattab').addClass('selected');
    this._find('.eqptabp').hide();
    this._find('.usetabp').hide();
    this._find('.mattabp').show();
  }.bind(this));

  this._el().show();
}
_InventoryDialog.prototype = Object.create(TestGui.Dialog.prototype);

_InventoryDialog.prototype.show = function() {
  this._el().show();
};
_InventoryDialog.prototype.hide = function() {
  this._el().hide();
};
_InventoryDialog.prototype.toggle = function() {
  this._el().toggle();
};

_InventoryDialog.prototype._update = function() {
  var invData = this.data;

  for (var i = 0; i < invData.items.length; ++i) {
    var itm = invData.items[i];
    var itemText = GenerateItemToolHtml(itm);

    var itmSlot = this._getSlot(itm.location, itm.slotNo);
    itmSlot.css('background-color', '#00ff00');
    var ttip = null;
    itmSlot.mouseenter(function(itm, itemText, e) {
      ttip = $('<div class="ttip" />');
      ttip.html(itemText);
      ttip.css('left', e.pageX + 'px');
      ttip.css('top', e.pageY + 'px');
      $('body').append(ttip);
    }.bind(this, itm, itemText));
    itmSlot.mousemove(function(e) {
      if (ttip) {
        ttip.css('left', e.pageX + 'px');
        ttip.css('top', e.pageY + 'px');
      }
    });
    itmSlot.mouseleave(function() {
      if(ttip) {
        ttip.remove();
        ttip = null;
      }
    });
  }

  this._find('.money').text(invData.money.toNumber());
};

_InventoryDialog.prototype._getSlot = function(slotLoc, slotNo) {
  var foundSlot = null;
  if (slotLoc === ITEMLOC.EQUIPPED_EQUIP) {
    foundSlot = this._find('#eqp_' + slotNo);
  } else if (slotLoc === ITEMLOC.EQUIPPED_AMMO) {
    foundSlot = this._find('#sht_' + slotNo);
  } else if (slotLoc === ITEMLOC.EQUIPPED_COSTUME) {
    foundSlot = this._find('#cst_' + slotNo);
  } else if (slotLoc === ITEMLOC.EQUIPPED_PAT) {
    foundSlot = this._find('#pat_' + slotNo);
  } else if (slotLoc === ITEMLOC.INVENTORY) {
    foundSlot = this._find('#itm_' + slotNo);
  } else {
    throw new Error('Could not find slottype for: ' + slotLoc + ', ' + slotNo);
  }
  if (!foundSlot || foundSlot.length === 0) {
    throw new Error('Could not find slotno for: ' + slotLoc + ', ' + slotNo);
  }
  return foundSlot;
};


function _MenuDialog(gameUi) {
  TestGui.Dialog.call(this, '#dlgMenu');

  this._find('.inventory').click(function() {
    gameUi.inventory.toggle();
  })

  this._el().show();
}
_MenuDialog.prototype = Object.create(TestGui.Dialog.prototype);



function _GameUi(charData) {
  this.menu = new _MenuDialog(this);
  this.charInfo = new _CharInfoDialog(charData);
  this.inventory = new _InventoryDialog(charData.inventory);
  this.inventory.hide();
}

_GameUi.prototype.close = function() {
  this.menu._destroy();
  this.inventory._destroy();
  this.charInfo._destroy();
};

TestGui.prototype.showGameUi = function(charData) {
  return new _GameUi(charData);
};

function initTestGui() {
  // Add all the inventory icons
  var invDlg = $('#dlgInventory');
  var invPages = [
    invDlg.find('.eqptabp'),
    invDlg.find('.usetabp'),
    invDlg.find('.mattabp')
  ];
  for (var invI = 0; invI < 90; ++invI) {
    var pageIdx = Math.floor(invI / 30);
    var colNum = (invI%30) % 6;
    var rowNum = Math.floor((invI%30) / 6);
    var invPage = invPages[pageIdx];
    var elItem = $('<div class="itemslot" />');
    elItem.attr('id', 'itm_' + invI);
    elItem.css('left', (10+colNum*44) + 'px');
    elItem.css('top', (218+rowNum*44) + 'px');
    elItem.html('Item<br />' + invI);
    invPage.append(elItem);
  }

  var patPage = invDlg.find('.patparts');
  for (var invI = 0; invI < 30; ++invI) {
    var colNum = invI % 6;
    var rowNum = Math.floor(invI / 6);
    var elItem = $('<div class="itemslot" />');
    elItem.attr('id', 'pat_' + invI);
    elItem.css('left', (10+colNum*44) + 'px');
    elItem.css('top', (218+rowNum*44) + 'px');
    elItem.html('Part<br />' + invI);
    patPage.append(elItem);
  }
};

// Everything below here is a massive hack just to get it working
//   for now, I feel disgusted and ashamed.
TestGui.prototype._prepareDone = function() {
  this._isPrepared = true;
  if (this._prepareCb) {
    this._prepareCb();
    this._prepareCb = null;
  }
};
TestGui.prototype.prepare = function(callback) {
  if (this._isPrepared) {
    callback();
  } else {
    this._prepareCb = callback;
  }
};
var testGui = new TestGui();
TestGui.tpls = $('<div class="tpls">');
TestGui.tpls.hide();
TestGui._el().append(TestGui.tpls);
TestGui.tpls.load('/gui/test/dialogs.html', function() {
  initTestGui();
  testGui._prepareDone();
});

var GUI = testGui;
