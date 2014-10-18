var EventEmitter = require('../util/eventemitter');

global.HOT_ICON_TYPE = {
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

HotIcons.prototype.setIcon = function(id, type, slot) {
  var icon = this.icons[id];
  icon.type = type;
  icon.slot = slot;
  this.emit('changed', [id]);
};

HotIcons.prototype.setIcons = function(icons) {
  this.icons = icons;
  this.emit('changed');
};

module.exports = HotIcons;
