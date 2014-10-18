function _LoadScreen() {
}

_LoadScreen.prototype.show = function() {
  $('#loadScreen').show();
};

_LoadScreen.prototype.hide = function() {
  $('#loadScreen').hide();
};

var LoadScreen = new _LoadScreen();
module.exports = LoadScreen;
