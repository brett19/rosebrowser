'use strict';

var IconManager = function() {
  this.baseUrl = '//rbimg.br19.com';
  this.sheetWidth = 13;
  this.sheetHeight = 13;
};

IconManager.Icon = function(url, x, y) {
  this.url = url;
  this.x = x;
  this.y = y;
};

IconManager.prototype.getItemIcon = function(id) {
  var sheet = 1 + Math.floor(id / (this.sheetWidth * this.sheetHeight));
  var col = id % this.sheetWidth;
  var row = Math.floor(id / this.sheetHeight) % this.sheetHeight;

  sheet = sheet.toString();
  if (sheet.length === 1) {
    sheet = '0' + sheet;
  }

  var url = this.baseUrl + '/ICON' + sheet + '.png';
  var x = col * -40;
  var y = row * -40;
  return new IconManager.Icon(url, x, y);
};

var iconManager = new IconManager();
