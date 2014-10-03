ui.LoginDialog = function(template) {
  ui.Dialog.call(this, template);

  this.username = ui.textbox(this, '.username');
  this.password = ui.textbox(this, '.password');
  this.remember = ui.checkbox(this, '.checkbox.remember');

  var username = localStorage.getItem('login_user');
  if (username) {
    this.username.text(username);
    this.remember.checked(true);
  }

  this.username.on('returnpressed', this._login.bind(this));
  this.password.on('returnpressed', this._login.bind(this));
  ui.button(this, '.button.submit').on('clicked', this._login.bind(this));
}

ui.LoginDialog.prototype = Object.create(ui.Dialog.prototype);

ui.LoginDialog.prototype._login = function() {
  var username = this.username.text();
  var password = this.password.text();

  if (this.remember.checked()) {
    localStorage.setItem('login_user', username);
  }

  this.emit('done', username, password);
  this.close();
};

ui.loginDialog = function() {
  return new ui.LoginDialog('#dlgLogin');
};
