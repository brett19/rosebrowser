'use strict';

function LoginState() {
}

LoginState.prototype.prepare = function(callback) {
  callback();
};

LoginState.prototype.enter = function() {
  LoginDialog.show();
  LoginDialog.setUsername('test');
  LoginDialog.setPassword('test');
  LoginDialog.on('loginClicked', function() {
    console.log('LOGIN CLICKED!', LoginDialog.getUsername(), LoginDialog.getPassword());
  });
};

LoginState.prototype.leave = function() {

};

LoginState.prototype.update = function(delta) {

};
