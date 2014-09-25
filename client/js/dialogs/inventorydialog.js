'use strict';

function _InventoryDialog() {
  EventEmitter.call(this);

  var self = this;
  $(function() {
    self.me = $('#dlgInventory');
  });
  this.boundInvData = null;
}
_InventoryDialog.prototype = new EventEmitter();

_InventoryDialog.prototype.show = function() {
  this.me.show();
};
_InventoryDialog.prototype.hide = function() {
  this.me.hide();
};

_InventoryDialog.prototype._getSlot = function(loc, slotNo) {
  if (loc === ITEMLOC.EQUIPPED_EQUIP) {
    return this.me.find('#eqp_'+slotNo);
  } else if (loc === ITEMLOC.INVENTORY) {
    if (slotNo < 30) {
      return this.me.find('#itm_'+slotNo);
    }
  } else {
    throw new Error('unknown slot type');
  }
};

function GenerateItemToolHtml(itm) {
  var itemText = '';

  var ItemDb = GDM.getNow('item_data');
  var itmData = ItemDb.getData(itm.itemType, itm.itemNo);
  var itmName = ItemDb.getName(itm.itemType, itm.itemNo);

  itemText += '<b>' + itmName + '</b><br />';


  return itemText;
}

_InventoryDialog.prototype._updateData = function() {
  var invData = this.boundInvData;

  for (var i = 0; i < INVEQUIPIDX.MAX; ++i) {
    this.me.find('#eqp_'+i).css('background-color', '#eeeeee');
  }
  for (var i = 0; i < 30; ++i) {
    this.me.find('#itm_'+(i+1)).css('background-color', '#eeeeee');
  }
  for (var i = 0; i < AVTSHOTTYPE.Max; ++i) {
    this.me.find('#sht_'+i).css('background-color', '#eeeeee');
  }

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

  this.me.find('#moneyVal').text(invData.money.toNumber());
};

_InventoryDialog.prototype.bindToData = function(invData) {
  this.boundInvData = invData;
  this._updateData();
};

var InventoryDialog = new _InventoryDialog();
