'use strict';

function _LoginDialog() {
  EventEmitter.call(this);

  var self = this;
  $(function() {
    self.me = $('#dlgLogin');

    self.me.find('#loginSubmit').on('click', function() {
      self.emit('loginClicked');
      return false;
    });
  });
}
_LoginDialog.prototype = new EventEmitter();

_LoginDialog.prototype.show = function() {
  this.me.show();
};
_LoginDialog.prototype.hide = function() {
  this.me.hide();
};

_LoginDialog.prototype.getUsername = function() {
  return this.me.find('#username').val();
};
_LoginDialog.prototype.getPassword = function() {
  return this.me.find('#password').val();
};

_LoginDialog.prototype.setUsername = function(value) {
  this.me.find('#username').val(value);
};
_LoginDialog.prototype.setPassword = function(value) {
  this.me.find('#password').val(value);
};




var LoginDialog = new _LoginDialog();
