'use strict';

var IconManager = function() {
  this.sheetWidth = 13;
  this.sheetHeight = 13;
};

IconManager.prototype.getItemIcon = function(item) {
  var itemData = GDM.getNow('item_data');
  var data = itemData.getData(item.itemType, item.itemNo);
  var iconId = data[9]

  var sheet = 1 + Math.floor(iconId / (this.sheetWidth * this.sheetHeight));
  var col = iconId % this.sheetWidth;
  var row = Math.floor(iconId / this.sheetHeight) % this.sheetHeight;
  var className = 'item-iconsheet-' + sheet;

  var html = '<div class="icon ' + className + '" style="';
  html += 'background-position: ' + (col * -40) + 'px ' + (row * -40) + 'px; ';
  html += '">';

  if (item.itemType === ITEMTYPE.USE ||
      item.itemType === ITEMTYPE.ETC ||
      item.itemType === ITEMTYPE.NATURAL ||
      item.itemType === ITEMTYPE.QUEST) {
    html += '<div class="quantity">' + item.quantity + '</div>';
  }

  // TODO: Socket / gem

  html += '</div>';
  return $(html);
};

var iconManager = new IconManager();
