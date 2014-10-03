ui.InventoryDialog = function(template, inventory) {
  ui.Dialog.call(this, template);

  this.pageTabs = ui.tabpanel(this, '.tabpanel.page');
  this.inventoryTabs = ui.tabpanel(this, '.tabpanel.inventory');
  this.inventorySlots = [];
  this.ammoSlots = [];
  this.equipSlots = [];

  for (var i = 1; i <= 90; ++i) {
    var id   = '.inventory-slot-' + i;
    var page = Math.floor((i - 1) / 30);
    var tab  = this.inventoryTabs.tab(page);
    var slot = ui.iconslot(tab, id, ['item']);

    if (i > 0 && (i % 6) === 0) {
      tab._element.append('<br />');
    }

    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this.inventorySlots.push(slot);
  }

  this.equippedTab = this.pageTabs.tab(0);

  for (var i = 1; i <= 11; ++i) {
    var id = '.equip-slot-' + i;
    var slot = ui.iconslot(this.equippedTab, id, ['item']);
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this.equipSlots[i] = slot;
  }

  for (var i = 0; i < 3; ++i) {
    var id = '.ammo-slot-' + i;
    var slot = ui.iconslot(this.equippedTab, id, ['item']);
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this.ammoSlots[i] = slot;
  }

  this.data = inventory;
  this._update();
};

ui.InventoryDialog.prototype = Object.create(ui.Dialog.prototype);

ui.InventoryDialog.prototype._swapItem = function(src, dst) {
  if (dst === 'equip') {
    console.log('equipItem', src);
  } else if (dst === 'drop') {
    console.log('dropItem', src);
  } else {
    console.log('swapItem', src, dst);
  }
};

ui.InventoryDialog.prototype._getItemSlot = function(location, id) {
  var slot = null;

  switch (location) {
  case ITEMLOC.INVENTORY:
    slot = this.inventorySlots[id];
    break;
  case ITEMLOC.EQUIPPED_EQUIP:
    slot = this.equipSlots[id];
    break;
  case ITEMLOC.EQUIPPED_AMMO:
    slot = this.ammoSlots[id];
    break;
  case ITEMLOC.EQUIPPED_COSTUME:
  case ITEMLOC.EQUIPPED_PAT:
  default:
    console.warn('_getItemSlot unexpected location ' + location);
  }

  return slot;
};

ui.InventoryDialog.prototype._update = function() {
  var itemData = GDM.getNow('item_data');
  for (var i = 0; i < this.data.items.length; ++i) {
    var item = this.data.items[i];
    var data = itemData.getData(item.itemType, item.itemNo);
    var name = itemData.getName(item.itemType, item.itemNo);
    var desc = itemData.getDescription(item.itemType, item.itemNo);
    var icon = iconManager.getItemIcon(data[9]);
    var slot = this._getItemSlot(item.location, item.slotNo);

    if (slot) {
      // TODO: Generate tooltip
      slot.setIcon(icon);
    }
  }
};

ui.inventoryDialog = function(inventory) {
  return new ui.InventoryDialog('#dlgInventory', inventory);
};

/*
function swapSlots(srcID, dstID) {
    console.log('swapSlots(' + srcID + ', ' + dstID + ')');
}

InventoryDialog.prototype.setItem = function(slotIndex, item) {
    slot.children('div').mousedown(function(downEvent) {
        var self = $(this);
        var startOffset = self.offset();

        self.css('z-index', 999);

        function mouseMove(moveEvent) {
          self.offset({
            left: moveEvent.pageX - downEvent.pageX + startOffset.left,
            top: moveEvent.pageY - downEvent.pageY + startOffset.top
          });
        }

        function mouseUp(upEvent) {
            var target;
            self.css('z-index', -999);
            target = $(document.elementFromPoint(upEvent.clientX, upEvent.clientY));
            self.css('z-index', 0);
            self.offset(startOffset);

            if (!target.hasClass('slot')) {
                target = target.parent();

                if (!target.hasClass('slot')) {
                    target = null;
                }
            }

            if (target && !target.is(slot)) {
                if (target.hasClass('accepts-' + type)) {
                    swapSlots(slot.attr('id'), target.attr('id'));
                }
            }

            $(document).off('mousemove', mouseMove);
            $(document).off('mouseup', mouseUp);
        }

        $(document).on('mousemove', mouseMove);
        $(document).on('mouseup', mouseUp);
    });
};
*/
