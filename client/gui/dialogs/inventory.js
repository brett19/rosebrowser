'use strict';
ui.loadTemplateFile('inventory.html');

ui.InventoryDialog = function(inventory) {
  ui.Dialog.call(this, 'inventory.html');

  this._pageTabs = ui.tabpanel(this, '.tabpanel.page');
  this._inventoryTabs = ui.tabpanel(this, '.tabpanel.inventory');
  this._inventorySlots = [];
  this._ammoSlots = [];
  this._equipSlots = [];

  for (var i = 1; i <= 90; ++i) {
    var id   = '.inventory-slot-' + i;
    var page = Math.floor((i - 1) / 30);
    var tab  = this._inventoryTabs.tab(page);
    var slot = ui.iconslot(id);
    slot.acceptsItem(true);
    tab.append(slot);

    if (i > 0 && (i % 6) === 0) {
      tab._element.append('<br />');
    }

    slot.on('swap', this._swapSlot.bind(this, slot));
    this._inventorySlots.push(slot);
  }

  this._equippedTab = this._pageTabs.tab(0);

  for (var i = 1; i <= 11; ++i) {
    var id = '.equip-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id);
    slot.acceptsItem(true);
    slot.on('swap', this._swapSlot.bind(this, slot));
    this._equipSlots[i] = slot;
  }

  for (var i = 0; i < 3; ++i) {
    var id = '.ammo-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id);
    slot.acceptsItem(true);
    slot.on('swap', this._swapSlot.bind(this, slot));
    this._ammoSlots[i] = slot;
  }

  this._data = inventory;
  this._data.on('changed', this._update.bind(this));
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

ui.InventoryDialog.prototype._swapSlot = function(srcSlot, dst) {
  var dstLocInfo = getItemLocationFromName(dst);
  var item = srcSlot.icon();

  // Drop item
  if (dst === 'drop') {
    this._data.dropItem(item);
    return;
  }

  var dstLocInfo = getItemLocationFromName(dst);

  if (!dstLocInfo) {
    // Move to quickbar
    var match = dst.match(/^quick-slot-([0-9]*)$/);

    if (match) {
      var slot = this._data.getSlotFromLocSlot(item.location, item.slotNo);
      if (slot) {
        netGame.setHotIcon(match[1], HOT_ICON_TYPE.ITEM, slot);
      }
      return;
    }

    return;
  }

  var dstLocation = dstLocInfo.location;

  // Equip -> Equip does nothing
  if (item.location !== ITEMLOC.INVENTORY && dstLocation !== ITEMLOC.INVENTORY) {
    return;
  }

  // Equip or unquip item
  if (item.location === ITEMLOC.EQUIPPED_EQUIP || dstLocation === ITEMLOC.EQUIPPED_EQUIP) {
    srcSlot.use();
    return;
  }

  // Inventory -> Inventory is client side
  if (item.location === ITEMLOC.INVENTORY && dstLocation === ITEMLOC.INVENTORY) {
    var dstSlot = this._getItemSlot(dstLocInfo.location, dstLocInfo.slot);
    var tmp = dstSlot._element.offset();
    dstSlot._element.offset(srcSlot._element.offset());
    srcSlot._element.offset(tmp);
    return;
  }

  console.warn('Unhandled _swapSlots', srcSlot, dstLocation);
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
  // Clear previous
  for (var i = 0; i < this._inventorySlots.length; ++i) {
    if (this._inventorySlots[i]) {
      this._inventorySlots[i].clear();
    }
  }

  for (var i = 0; i < this._equipSlots.length; ++i) {
    if (this._equipSlots[i]) {
      this._equipSlots[i].clear();
    }
  }
  for (var i = 0; i < this._ammoSlots.length; ++i) {
    if (this._ammoSlots[i]) {
      this._ammoSlots[i].clear();
    }
  }

  // Set current
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
  return new ui.InventoryDialog(inventory);
};
