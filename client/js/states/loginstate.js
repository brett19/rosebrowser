'use strict';

function LoginState() {

}

LoginState.prototype.prepare = function(callback) {
  callback();
};

LoginState.prototype.enter = function() {
  $('#dlgLogin').show();
};

LoginState.prototype.leave = function() {

};

LoginState.prototype.update = function(delta) {

};
