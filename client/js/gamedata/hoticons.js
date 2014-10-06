'use strict';

var HOT_ICON_TYPE = {
  EMPTY: 0,
  ITEM: 1,
  COMMAND: 2,
  SKILL: 3,
  EMOTE: 4,
  DIALOG: 5,
  CLAN_SKILL: 6
};

var HotIcons = function() {
  EventEmitter.call(this);
  this.icons = [];
};

HotIcons.prototype = Object.create(EventEmitter.prototype);

HotIcons.Icon = function(type, slot) {
  this.type = type;
  this.slot = slot;
};

HotIcons.prototype.setIcons = function(icons) {
  this.icons = [];

  for (var i = 0; i < icons.length; ++i) {
    this.icons.push(new HotIcons.Icon(icons[i] & 0x1f, icons[i] >> 5));
  }

  console.log(this.icons);
  this.emit('changed');
};
