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
    var slot = ui.iconslot(id);
    slot.acceptsItem(true);
    tab.append(slot);

    if (i > 0 && (i % 6) === 0) {
      tab._element.append('<br />');
    }

    slot.on('use', this._useItem.bind(this, id.substr(1)));
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this._inventorySlots.push(slot);
  }

  this._equippedTab = this._pageTabs.tab(0);

  for (var i = 1; i <= 11; ++i) {
    var id = '.equip-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id);
    slot.acceptsItem(true);
    slot.on('use', this._useItem.bind(this, id.substr(1)));
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
    this._equipSlots[i] = slot;
  }

  for (var i = 0; i < 3; ++i) {
    var id = '.ammo-slot-' + i;
    var slot = ui.iconslot(this._equippedTab, id);
    slot.acceptsItem(true);
    slot.on('use', this._useItem.bind(this, id.substr(1)));
    slot.on('swap', this._swapItem.bind(this, id.substr(1)));
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

ui.InventoryDialog.prototype._useItem = function(src) {
  var locInfo = getItemLocationFromName(src);
  var itemSlot = this._getItemSlot(locInfo.location, locInfo.slot);
  var item = itemSlot.icon();
  var location = locInfo.location;

  // TODO: MOve useItem code to inventorydata?

  if (location === ITEMLOC.EQUIPPED_EQUIP) {
    netGame.equipItem(ITMTYPETOPART[item.itemType], 0);
  } else if (location === ITEMLOC.EQUIPPED_AMMO) {
    // TODO: Unequip ammo
  } else if (location === ITEMLOC.INVENTORY) {
    if (ITMTYPETOPART[item.itemType]) {
      netGame.equipItem(ITMTYPETOPART[item.itemType], item.itemKey);
    } else if (item.itemType === ITEMTYPE.USE) {
      // TODO: Use consumable
    } else if (item.itemType === ITEMTYPE.RIDE_PART) {
      // TODO: Use ride part
    }else if (item.itemType === ITEMTYPE.MOUNT) {
      // TODO: Use mount
    }
  }
};

ui.InventoryDialog.prototype._swapItem = function(src, dst) {
  var srcLocInfo = getItemLocationFromName(src);
  var dstLocInfo = getItemLocationFromName(dst);

  if (!srcLocInfo) {
    throw new Error('Swap item src invalid');
    return;
  }

  var srcLocation = srcLocInfo.location;
  var srcItemSlot = this._getItemSlot(srcLocInfo.location, srcLocInfo.slot);
  var srcItem = srcItemSlot.icon();

  if (dst === 'drop') {
    ui.messageBox('Are you sure you want to drop item?', ['YES', 'NO'])
      .on('closed', function(answer) {
        if (answer === 'YES') {
          // TODO: Drop srcItem
          console.log('dropItem', srcItem);
        }
      });

    return;
  }

  var dstLocInfo = getItemLocationFromName(dst);

  if (!dstLocInfo) {
    // TODO: Dest is not inventory, could be skillbar...
    return;
  }

  var dstLocation = dstLocInfo.location;
  var dstItemSlot = this._getItemSlot(dstLocInfo.location, dstLocInfo.slot);
  var dstItem = dstItemSlot.icon();

  if (srcLocation === ITEMLOC.EQUIPPED_EQUIP && dstLocation == ITEMLOC.EQUIPPED_EQUIP) {
    return;
  }

  if (srcLocation === ITEMLOC.EQUIPPED_EQUIP) {
    // Unequip srcItem.
    this._useItem(src);
    return;
  }

  if (dstLocation === ITEMLOC.EQUIPPED_EQUIP) {
    // Equip srcItem
    this._useItem(src);
    return;
  }

  if (srcLocation === ITEMLOC.INVENTORY && dstLocation === ITEMLOC.INVENTORY) {
    var tmp = dstItemSlot._element.offset();
    dstItemSlot._element.offset(srcItemSlot._element.offset());
    srcItemSlot._element.offset(tmp);
    return;
  }

  console.warn('Unhandled _swapItems', srcLocation, dstLocation);
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
  return new ui.InventoryDialog('#dlgInventory', inventory);
};
