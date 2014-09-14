'use strict';

function _MsgBoxDialog() {
  EventEmitter.call(this);
}
_MsgBoxDialog.prototype = new EventEmitter();

_MsgBoxDialog.prototype.create = function(message, okBtn, callback) {
  var baseDialog = $('#dlgMsgBox');

  var newDialog = baseDialog.clone();
  newDialog.find('#messageText').text(message);
  if (okBtn) {
    newDialog.find('#okButton').on('click', function () {
      newDialog.remove();
      if (callback) {
        callback(true);
      }
    });
  } else {
    newDialog.find('#okButton').hide();
  }
  newDialog.insertAfter(baseDialog);
  newDialog.show();
  return {
    setMessage: function(message) {
      newDialog.find('#messageText').text(message);
    },
    close: function() {
      newDialog.remove();
      if (callback) {
        callback(false);
      }
    }
  };
};

var MsgBoxDialog = new _MsgBoxDialog();
