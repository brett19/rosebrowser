'use strict';
ui.loadTemplateFile('quickbar.html');

ui.QuickBarDialog = function(hotIcons) {
  ui.Dialog.call(this, 'quickbar.html');
  this.centerX();

  this._slots = [];
  this._hotIcons = [];

  for (var i = 1; i <= 12; ++i) {
    var id = '.quick-slot-' + i;
    var slot = ui.iconslot(this, id);
    var index = this._slots.length;
    slot.on('use', this._useSlot.bind(this, index));
    slot.on('swap', this._swapSlot.bind(this, index));
    this._slots.push(slot);
  }

  this._hotIcons = hotIcons;
  MC.inventory.on('changed', this._update.bind(this));
  this._hotIcons.on('changed', this._update.bind(this));
  this._update();
};

ui.QuickBarDialog.prototype = Object.create(ui.Dialog.prototype);

ui.QuickBarDialog.prototype._useSlot = function(index) {
  var hotIcon = this._hotIcons.icons[index];
  var type = hotIcon.type;
  var slot = hotIcon.slot;

  switch (type) {
  case HOT_ICON_TYPE.ITEM:
    var item = MC.inventory.findBySlot(slot);
    if (item) {
      MC.inventory.useItem(item);
    }
    break;
  case HOT_ICON_TYPE.SKILL:
    var skill = MC.skills.findBySlot(slot);
    if (skill) {
      MC.skills.useSkill(skill);
    }
    break;
  case HOT_ICON_TYPE.COMMAND:
  case HOT_ICON_TYPE.EMOTE:
  case HOT_ICON_TYPE.DIALOG:
  case HOT_ICON_TYPE.CLAN_SKILL:
  default:
    console.warn('Unimplemented hot icon type in _useSlot', type);
  };
};

ui.QuickBarDialog.prototype._swapSlot = function(src, dst) {
  console.log('quickbar._swapSlot', src, dst);
};

ui.QuickBarDialog.prototype._update = function() {
  for (var i = 0; i < this._hotIcons.icons.length && i < this._slots.length; ++i) {
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
  return new ui.QuickBarDialog(hotIcons);
};
