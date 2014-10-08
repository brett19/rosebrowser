'use strict';
ui.loadTemplateFile('quickbar.html');

ui.QuickBarDialog = function(hotIcons, startIndex) {
  ui.Dialog.call(this, 'quickbar.html');

  this._slotsContainer = this._element.children('.slots');
  this._startIndex = startIndex;
  this._slots = [];
  this._hotIcons = [];

  for (var i = 0; i < ui.QuickBarDialog.SLOTS_PER_BAR; ++i) {
    var id = '.quick-slot-' + (i + startIndex);
    var slot = ui.iconslot(id);
    var index = this._slots.length;
    slot.acceptsAll(true);
    slot.on('swap', this._swapSlot.bind(this, index));
    this._slots.push(slot);
    this._slotsContainer.append(slot._element);
  }

  this.centerX();

  this._hotIcons = hotIcons;
  MC.skills.on('changed', this._update.bind(this));
  MC.inventory.on('changed', this._update.bind(this));
  this._hotIcons.on('changed', this._update.bind(this));
  this._update();
};

ui.QuickBarDialog.SLOTS_PER_BAR = 12;

ui.QuickBarDialog.prototype = Object.create(ui.Dialog.prototype);

ui.QuickBarDialog.prototype._swapSlot = function(src, dst) {
  console.log('quickbar._swapSlot', src, dst);
};

ui.QuickBarDialog.prototype._update = function() {
  for (var i = 0; i < this._slots.length; ++i) {
    var hotIcon = this._hotIcons.icons[i];
    var type = hotIcon.type;
    var slot = hotIcon.slot;
    var icon;

    switch (type) {
    case HOT_ICON_TYPE.ITEM:
      icon = MC.inventory.findBySlot(slot);
      break;
    case HOT_ICON_TYPE.SKILL:
      icon = MC.skills.findBySlot(slot);
      break;
    case HOT_ICON_TYPE.COMMAND:
    case HOT_ICON_TYPE.EMOTE:
    case HOT_ICON_TYPE.DIALOG:
    case HOT_ICON_TYPE.CLAN_SKILL:
    default:
      console.warn('Unhandled HOT_ICON_TYPE', type);
    }

    if (icon) {
      this._slots[i].setIcon(type, icon);
    }
  }
};

ui.quickBarDialog = function(hotIcons) {
  return new ui.QuickBarDialog(hotIcons, 0);
};
