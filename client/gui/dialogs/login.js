'use strict';

ui.LoginDialog = function(template) {
  ui.Dialog.call(this, template);

  this._username = ui.textbox(this, '.textbox.username');
  this._password = ui.textbox(this, '.textbox.password');
  this._remember = ui.checkbox(this, '.checkbox.remember');

  var username = localStorage.getItem('login_user');
  if (username) {
    this._username.text(username);
    this._remember.checked(true);
  }

  this._username.on('returnpressed', this._login.bind(this));
  this._password.on('returnpressed', this._login.bind(this));
  ui.button(this, '.button.submit').on('clicked', this._login.bind(this));

  this.center();
}

ui.LoginDialog.prototype = Object.create(ui.Dialog.prototype);

ui.LoginDialog.prototype._login = function() {
  var username = this._username.text();
  var password = this._password.text();

  if (this._remember.checked()) {
    localStorage.setItem('login_user', username);
  }

  this.emit('done', username, password);
  this.close();
};

ui.loginDialog = function() {
  return new ui.LoginDialog('#dlgLogin');
};
