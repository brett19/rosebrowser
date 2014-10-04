ui.InventoryDialog = function(template, inventory) {
  ui.Dialog.call(this, template);

  this._pageTabs = ui.tabpanel(this, '.tabpanel.page');
  this._inventoryTabs = ui.tabpanel(this, '.tabpanel.inventory');
  this._inventorySlots = [];
  this._ammoSlots = [];
  this._equipSlots = [];

  for (var i = 1; i <= 90; ++i) {
    var id   = '.inventory-slot-' + i;
    var page = Math.floor((i - 1) / 30);
    var tab  = this._inventoryTabs.tab(page);
    var slot = ui.iconslot(tab, id, ['item']);

    if (i > 0 && (i % 6) === 0) {
      tab._element.append('<br />');
    }

    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this._inventorySlots.push(slot);
  }

  this._equippedTab = this._pageTabs.tab(0);

  for (var i = 1; i <= 11; ++i) {
    var id = '.equip-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id, ['item']);
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this._equipSlots[i] = slot;
  }

  for (var i = 0; i < 3; ++i) {
    var id = '.ammo-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id, ['item']);
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this._ammoSlots[i] = slot;
  }

  this._data = inventory;
  this._update();
};

ui.InventoryDialog.prototype = Object.create(ui.Dialog.prototype);

function getItemLocationFromName(name) {
  var match;
  if (match = name.match(/inventory-slot-([0-9]*)/)) {
    return { location: ITEMLOC.INVENTORY, slot: parseInt(match[1]) - 1 };
  } else if (match = name.match(/equip-slot-([0-9]*)/)) {
    return { location: ITEMLOC.EQUIPPED_EQUIP, slot: parseInt(match[1]) };
  } else if (match = name.match(/ammo-slot-([0-9]*)/)) {
    return { location: ITEMLOC.EQUIPPED_AMMO, slot: parseInt(match[1]) };
  } else {
    return null;
  }
}

ui.InventoryDialog.prototype._swapItem = function(src, dst) {
  if (dst.indexOf('equip') === 0) {
    var srcLocation = getItemLocationFromName(src);
    if (srcLocation.location === ITEMLOC.EQUIPPED_EQUIP) {
      // TODO: Send packet asking to unequip item
      console.log('unequipItem', src);
    } else if (srcLocation.location === ITEMLOC.EQUIPPED_EQUIP) {
      // TODO: Send packet asking to unequip ammo
      console.log('unequipItem', src);
    } else if (srcLocation.location === ITEMLOC.INVENTORY) {
      // TODO: Send packet asking to equip item
      console.log('equipItem', src);
    }
  } else if (dst === 'drop') {
    console.log('dropItem', src);
    // TODO: Send packet asking to drop item
  } else {
    var srcLocation = getItemLocationFromName(src);
    var dstLocation = getItemLocationFromName(dst);

    if (srcLocation.location === ITEMLOC.EQUIPPED_EQUIP) {
      console.log('unequipItem', src);
      // TODO: Send packet asking to unequip item
    } else if (srcLocation.location === ITEMLOC.EQUIPPED_AMMO) {
      console.log('unequipAmmo', src);
      // TODO: Send packet asking to unequip ammo
    } else if (srcLocation && dstLocation) {
      console.log('swapItem', src, dst);
      var srcSlot = this._getItemSlot(srcLocation.location, srcLocation.slot);
      var dstSlot = this._getItemSlot(dstLocation.location, dstLocation.slot);
      var tmp = srcSlot.getIcon();
      srcSlot.setIcon(dstSlot.getIcon());
      dstSlot.setIcon(tmp);
    }
  }
};

ui.InventoryDialog.prototype._getItemSlot = function(location, id) {
  var slot = null;

  switch (location) {
  case ITEMLOC.INVENTORY:
    slot = this._inventorySlots[id];
    break;
  case ITEMLOC.EQUIPPED_EQUIP:
    slot = this._equipSlots[id];
    break;
  case ITEMLOC.EQUIPPED_AMMO:
    slot = this._ammoSlots[id];
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
  for (var i = 0; i < this._data.items.length; ++i) {
    var item = this._data.items[i];
    var slot = this._getItemSlot(item.location, item.slotNo);

    if (slot) {
      slot.setItem(item);
    }
  }
};

ui.inventoryDialog = function(inventory) {
  return new ui.InventoryDialog('#dlgInventory', inventory);
};
