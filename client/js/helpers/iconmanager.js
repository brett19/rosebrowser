'use strict';

var IconManager = function() {
  this.sheetWidth = 13;
  this.sheetHeight = 13;
};

IconManager.prototype.getItemIcon = function(item) {
  var itemData = GDM.getNow('item_data');
  var data = itemData.getData(item.itemType, item.itemNo);
  var iconId = data[9];

  var sheet = 1 + Math.floor(iconId / (this.sheetWidth * this.sheetHeight));
  var col = iconId % this.sheetWidth;
  var row = Math.floor(iconId / this.sheetHeight) % this.sheetHeight;
  var className = 'item-iconsheet-' + sheet;

  var html = '<div class="icon ' + className + '" style="';
  html += 'background-position: ' + (col * -40) + 'px ' + (row * -40) + 'px; ';
  html += '">';

  if (ITMSTACKABLE[item.itemType]) {
    html += '<div class="quantity">' + item.quantity + '</div>';
  }

  // TODO: Socket / gem

  html += '</div>';
  return $(html);
};

IconManager.prototype.getCommandIcon = function(command) {
};

IconManager.prototype.getSkillIcon = function(skill) {
  var skillData = GDM.getNow('skill_data');
  var data = skillData.getData(skill.skillIdx);
  var iconId = data[51];

  var sheet = 1 + Math.floor(iconId / (this.sheetWidth * this.sheetHeight));
  var col = iconId % this.sheetWidth;
  var row = Math.floor(iconId / this.sheetHeight) % this.sheetHeight;
  var className = 'skill-iconsheet-' + sheet;

  var html = '<div class="icon ' + className + '" style="';
  html += 'background-position: ' + (col * -40) + 'px ' + (row * -40) + 'px; ';
  html += '">';
  html += '</div>';
  return $(html);
};

IconManager.prototype.getEmoteIcon = function(emote) {
};

IconManager.prototype.getDialogIcon = function(dialog) {
};

IconManager.prototype.getClanSkillIcon = function(skill) {
};

var iconManager = new IconManager();
